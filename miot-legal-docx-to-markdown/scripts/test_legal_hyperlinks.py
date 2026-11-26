"""Regression cases for hyperlink text, destinations, boundaries and failure gates."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

import convert_legal_docx as converter
from legal_hyperlinks import verify_hyperlinks


def field_char(run, kind):
    node = OxmlElement('w:fldChar')
    node.set(qn('w:fldCharType'), kind)
    run._r.append(node)


def append_text(run, text):
    node = OxmlElement('w:t')
    node.set(qn('xml:space'), 'preserve')
    node.text = text
    run._r.append(node)


def complex_link(paragraph, instruction, label, shape='normal'):
    field_char(paragraph.add_run(), 'begin')
    fragments = [instruction[:7], instruction[7:]] if shape == 'split' else [instruction]
    for fragment in fragments:
        node = OxmlElement('w:instrText')
        node.text = fragment
        paragraph.add_run()._r.append(node)
    separator = paragraph.add_run()
    field_char(separator, 'separate')
    if shape == 'same_separator':
        append_text(separator, label)
    elif shape == 'styled':
        paragraph.add_run(label[:2]).bold = True
        paragraph.add_run(label[2:]).italic = True
    else:
        paragraph.add_run(label)
    if shape == 'same_end':
        last = paragraph.runs[-1]
        field_char(last, 'end')
        append_text(last, ' after')
    else:
        field_char(paragraph.add_run(), 'end')


def simple_link(paragraph, instruction, label):
    node = OxmlElement('w:fldSimple')
    node.set(qn('w:instr'), instruction)
    run = OxmlElement('w:r')
    text = OxmlElement('w:t')
    text.text = label
    run.append(text)
    node.append(run)
    paragraph._p.append(node)


def relationship_link(paragraph, url, label, anchor=None):
    node = OxmlElement('w:hyperlink')
    if url:
        node.set(qn('r:id'), paragraph.part.relate_to(url, RT.HYPERLINK, is_external=True))
    if anchor:
        node.set(qn('w:anchor'), anchor)
    run = OxmlElement('w:r')
    text = OxmlElement('w:t')
    text.text = label
    run.append(text)
    node.append(run)
    paragraph._p.append(node)


class HyperlinkTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)

    def tearDown(self):
        self.temporary.cleanup()

    def document(self, prefix='See '):
        document = Document()
        document.add_paragraph('Software License Agreement')
        return document, document.add_paragraph(prefix)

    def convert(self, document):
        source = self.root / 'agreement.docx'
        output = self.root / 'agreement.md'
        document.save(source)
        report = converter.convert_one(source, output, 'agreement', False)
        self.assertEqual(report['text_fidelity_status'], 'PASS')
        self.assertEqual(report['hyperlink_fidelity_status'], 'PASS')
        self.assertEqual(report['hyperlinks']['source'], report['hyperlinks']['matched'])
        return output.read_text(), report

    def test_complex_fields_and_boundaries(self):
        for shape in ('normal', 'split', 'same_separator', 'same_end', 'styled'):
            with self.subTest(shape=shape):
                document, p = self.document()
                complex_link(p, ' HYPERLINK "https://example.com/eea/" ', 'EEA', shape)
                p.add_run(' now.')
                text, report = self.convert(document)
                self.assertIn('https://example.com/eea/', text)
                self.assertEqual(report['hyperlinks']['source_links'][0]['label'], 'EEA')
                self.assertNotIn('[EEA after]', text)
                (self.root / 'agreement.md').unlink()

    def test_simple_field_only_paragraph(self):
        document, p = self.document('')
        simple_link(p, 'HYPERLINK "https://example.com/"', 'EEA')
        text, report = self.convert(document)
        self.assertIn('[EEA](<https://example.com/>)', text)
        self.assertEqual(report['paragraphs'], 2)

    def test_mail_query_and_bookmark(self):
        for target, instruction in (
            ('mailto:officer@example.com', 'HYPERLINK "mailto:officer@example.com"'),
            ('https://example.com/?a=1&b=2', 'HYPERLINK "https://example.com/?a=1&b=2"'),
            ('https://example.com/policy#rights', 'HYPERLINK "https://example.com/policy" \\l "rights"'),
            ('https://example.com/policy#rights', 'hyperlink "https://example.com/policy" \\L "rights"'),
            ('https://example.com/', 'HYPERLINK "https://example.com/" \\o "Tip" \\t "_blank" \\h \\* MERGEFORMAT'),
        ):
            with self.subTest(target=target):
                document, p = self.document()
                simple_link(p, instruction, 'Contact')
                text, _ = self.convert(document)
                self.assertIn(f'](<{target}>)', text)
                (self.root / 'agreement.md').unlink()

    def test_relationship_anchor(self):
        document, p = self.document()
        relationship_link(p, 'https://example.com/policy', 'Rights', 'rights')
        text, _ = self.convert(document)
        self.assertIn('[Rights](<https://example.com/policy#rights>)', text)

    def test_adjacent_same_target_links_remain_separate(self):
        document, p = self.document()
        for label in ('EEA', 'UK'):
            complex_link(p, 'HYPERLINK "https://example.com/"', label)
        text, report = self.convert(document)
        self.assertIn('[EEA](<https://example.com/>)[UK](<https://example.com/>)', text)
        self.assertEqual(report['hyperlinks']['matched'], 2)

    def test_rtl_and_whitespace(self):
        document, p = self.document('راجع')
        complex_link(p, 'HYPERLINK "https://example.com/"', '  السلطة  ')
        p.add_run('؛ الآن')
        text, _ = self.convert(document)
        self.assertIn('[السلطة](<https://example.com/>)', text)
        self.assertNotIn('[  ', text)

    def test_autolink_punctuation(self):
        document, p = self.document('')
        p.add_run('https://example.com/path،العربية https://example.com/path。中文')
        text, _ = self.convert(document)
        self.assertEqual(text.count('](<https://example.com/path>)'), 2)

    def test_internal_and_unknown_fields_fail(self):
        for instruction in ('HYPERLINK \\l "rights"', 'HYPERLINK "https://example.com/" \\m', 'HYPERLINK "https://example.com/" \\l "a" \\l "b"', 'HYPERLINK "unterminated', 'DATE'):
            with self.subTest(instruction=instruction):
                document, p = self.document()
                simple_link(p, instruction, 'Label')
                with self.assertRaises(converter.ConversionError) as error:
                    self.convert(document)
                self.assertEqual(error.exception.report['hyperlink_fidelity_status'], 'FAIL')
                self.assertTrue(error.exception.report['hyperlinks']['unparsed_fields'])

    def test_internal_relationship_fails(self):
        document, p = self.document()
        relationship_link(p, None, 'Rights', 'rights')
        with self.assertRaises(converter.ConversionError):
            self.convert(document)

    def test_unclosed_field_fails(self):
        document, p = self.document()
        field_char(p.add_run(), 'begin')
        with self.assertRaises(converter.ConversionError):
            self.convert(document)

    def test_nested_field_fails(self):
        document, p = self.document()
        field_char(p.add_run(), 'begin')
        field_char(p.add_run(), 'begin')
        with self.assertRaises(converter.ConversionError):
            self.convert(document)

    def test_link_gate_rejects_wrong_target_label_and_literal(self):
        document, p = self.document('')
        complex_link(p, 'HYPERLINK "https://example.com/"', 'EEA')
        p.add_run(' UK')
        paragraphs = converter.collect_paragraphs(document)
        for body in (
            'EEA UK',
            '[EEA](<https://wrong.example/>) UK',
            'EEA [UK](<https://example.com/>)',
            '`[EEA](<https://example.com/>)` UK',
            '[EEA UK](<https://example.com/>)',
        ):
            with self.subTest(body=body):
                output = self.root / 'bad.md'
                output.write_text('# Software License Agreement\n\n' + body + '\n')
                status, report = verify_hyperlinks(paragraphs, output, converter.find_pandoc())
                self.assertEqual(status, 'FAIL')

    def test_missing_renderer_cannot_pass(self):
        document, p = self.document()
        simple_link(p, 'HYPERLINK "https://example.com/"', 'EEA')
        with patch.object(converter, 'find_pandoc', return_value=None):
            with self.assertRaises(converter.ConversionError) as error:
                self.convert(document)
        self.assertEqual(error.exception.report['hyperlink_fidelity_status'], 'UNVERIFIED')

    def test_failed_cli_report_keeps_diagnostics(self):
        document, p = self.document()
        simple_link(p, 'HYPERLINK \\l "rights"', 'Rights')
        source = self.root / 'agreement.docx'
        document.save(source)
        report_file = self.root / 'report.json'
        process = subprocess.run([sys.executable, converter.__file__, str(source), '--output', str(self.root / 'result.md'), '--report', str(report_file)], capture_output=True, text=True)
        self.assertEqual(process.returncode, 1)
        report = json.loads(report_file.read_text())
        self.assertEqual(report['failed'], 1)
        self.assertTrue(report['failures'][0]['hyperlinks']['unparsed_fields'])


if __name__ == '__main__':
    unittest.main()
