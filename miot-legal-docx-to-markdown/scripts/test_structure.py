"""Regression cases for list-continuation alignment and source-defect warnings."""

import unittest
from unittest.mock import patch

from docx import Document
from docx.oxml.ns import qn

import convert_legal_docx as conv


def numbered(paragraph, num_id=12, level=0):
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = p_pr.get_or_add_numPr()
    num_pr.get_or_add_numId().val = num_id
    num_pr.get_or_add_ilvl().val = level
    return paragraph


def indented(paragraph, left=708):
    p_pr = paragraph._p.get_or_add_pPr()
    ind = p_pr.find(qn("w:ind"))
    if ind is None:
        ind = p_pr.makeelement(qn("w:ind"), {})
        p_pr.append(ind)
    ind.set(qn("w:left"), str(left))
    return paragraph


def build_document():
    document = Document()
    document.add_paragraph("Privacy Policy")
    document.add_paragraph("9. How to exercise your data protection rights?")
    numbered(indented(document.add_paragraph("For users located in India:")))
    indented(document.add_paragraph("Xiaomi Technology India Private Limited"))
    indented(document.add_paragraph("Email: grievance.officer@xiaomi.com"))
    document.add_paragraph("Please, make sure that you provide sufficient information.")
    return document


class ListContinuationTests(unittest.TestCase):
    def render(self, fmt):
        document = build_document()
        paragraphs = conv.collect_paragraphs(document)
        with patch.object(conv, "numbering_format", return_value=(fmt, 1)):
            markdown, stats = conv.render_document(document, paragraphs, "privacy")
        return markdown, stats, paragraphs

    def test_bullet_item_with_continuation_loses_its_marker(self):
        markdown, stats, paragraphs = self.render("bullet")
        self.assertNotIn("- ", markdown)
        self.assertIn("For users located in India:", markdown)
        self.assertEqual(stats["structure"]["list_continuation_paragraphs"], 2)
        self.assertEqual(len(stats["structure"]["flattened_list_items"]), 1)
        self.assertEqual(stats["structure"]["warnings"], [])
        # The un-indented closing paragraph is not attached to the list item.
        self.assertFalse(paragraphs[-1].is_list_continuation)

    def test_numbered_item_keeps_its_number_and_warns(self):
        markdown, stats, _ = self.render("decimal")
        self.assertIn("1. For users located in India:", markdown)
        self.assertEqual(len(stats["structure"]["warnings"]), 1)
        self.assertIn("review rendered alignment", stats["structure"]["warnings"][0])

    def test_standalone_list_item_keeps_its_marker(self):
        document = Document()
        document.add_paragraph("Privacy Policy")
        numbered(indented(document.add_paragraph("A plain bullet item.")))
        document.add_paragraph("An ordinary following paragraph.")
        paragraphs = conv.collect_paragraphs(document)
        with patch.object(conv, "numbering_format", return_value=("bullet", 1)):
            markdown, stats = conv.render_document(document, paragraphs, "privacy")
        self.assertIn("- A plain bullet item.", markdown)
        self.assertEqual(stats["structure"]["flattened_list_items"], [])


class LinkAdjacencyTests(unittest.TestCase):
    def info(self, text, label, start, end):
        return conv.ParagraphInfo(
            index=0, paragraph=None, text=text, style_name="Normal",
            outline_level=None, num_id=None, list_level=0, bold_ratio=0.0,
            hyperlinks=[{"label": label, "start": start, "end": end}],
        )

    def test_missing_space_after_link_is_flagged(self):
        text = "list of EEA/UK/Switzerlandcompetent authorities."
        start = text.index("Switzerland")
        info = self.info(text, "Switzerland", start, start + len("Switzerland"))
        warnings = conv.check_link_adjacency([info])
        self.assertEqual(len(warnings), 1)
        self.assertIn("after", warnings[0])

    def test_separated_link_is_not_flagged(self):
        text = "list of EEA/UK/Switzerland competent authorities."
        start = text.index("Switzerland")
        info = self.info(text, "Switzerland", start, start + len("Switzerland"))
        self.assertEqual(conv.check_link_adjacency([info]), [])

    def test_label_whitespace_does_not_create_a_false_positive(self):
        text = "reach us through https://privacy.mi.com/support."
        start = text.index(" https")
        info = self.info(text, " https://privacy.mi.com/support", start, len(text) - 1)
        self.assertEqual(conv.check_link_adjacency([info]), [])


if __name__ == "__main__":
    unittest.main()
