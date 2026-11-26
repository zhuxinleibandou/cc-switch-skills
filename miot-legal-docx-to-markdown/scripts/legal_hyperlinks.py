"""Read Word hyperlink fields and verify their rendered text ranges."""

import html
import json
import re
import subprocess
import unicodedata
from docx.text.run import Run

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
PANDOC_READER = 'gfm+raw_html-autolink_bare_uris'


class HyperlinkError(ValueError):
    def __init__(self, message, paragraph_index, instruction=''):
        super().__init__(message)
        self.issues = [{'paragraph_index': paragraph_index, 'instruction': instruction, 'error': message}]


def visible_text(paragraph):
    """Independent body-text inventory, including cached simple-field results."""
    return ''.join(
        element.text or '' if element.tag == W + 't' else
        '\t' if element.tag == W + 'tab' else '\n'
        for element in paragraph._p.iter()
        if element.tag in (W + 't', W + 'tab', W + 'br', W + 'cr')
    )


def field_destination(instruction, index):
    tokens = []
    position = 0
    while position < len(instruction):
        if instruction[position].isspace():
            position += 1
            continue
        if instruction[position] == '"':
            position += 1
            text = ''
            while position < len(instruction) and instruction[position] != '"':
                if instruction[position] == '\\' and position + 1 < len(instruction) and instruction[position + 1] in ('"', '\\'):
                    position += 1
                text += instruction[position]
                position += 1
            if position == len(instruction):
                raise HyperlinkError('Unterminated field-code string.', index, instruction)
            tokens.append(text)
            position += 1
        else:
            end = position
            while end < len(instruction) and not instruction[end].isspace():
                end += 1
            tokens.append(instruction[position:end])
            position = end
    if not tokens or tokens.pop(0).upper() != 'HYPERLINK':
        raise HyperlinkError('Unsupported field; cached text must be reviewed.', index, instruction)
    destination = None
    anchor = None
    position = 0
    while position < len(tokens):
        token = tokens[position]
        position += 1
        switch = token.lower()
        if switch in ('\\l', '\\o', '\\t', '\\*'):
            if position == len(tokens):
                raise HyperlinkError('Field switch lacks an argument.', index, instruction)
            argument = tokens[position]
            position += 1
            if switch == '\\l':
                if anchor is not None:
                    raise HyperlinkError('Repeated bookmark switch is ambiguous.', index, instruction)
                anchor = argument
            elif switch == '\\*' and argument.upper() != 'MERGEFORMAT':
                raise HyperlinkError('Unsupported field-format switch.', index, instruction)
        elif switch in ('\\h', '\\n'):
            # Legacy \h and opening-window switches do not change the destination.
            continue
        elif token.startswith('\\') or destination is not None:
            raise HyperlinkError('Unsupported or ambiguous hyperlink instruction.', index, instruction)
        else:
            destination = token
    if not destination:
        raise HyperlinkError('Internal bookmark fields are unsupported; review required.', index, instruction)
    if anchor:
        destination = destination.split('#', 1)[0] + '#' + anchor
    return destination


def parse_paragraph(paragraph, index):
    segments = []
    links = []
    state = None
    active = None
    offset = 0

    def fail(message, instruction=''):
        raise HyperlinkError(message, index, instruction)

    def open_link(destination, kind, instruction=''):
        nonlocal active
        if active is not None:
            fail('Nested hyperlinks are unsupported.', instruction)
        active = {'paragraph_index': index, 'link_index': len(links), 'kind': kind,
                  'instruction': instruction, 'destination': destination, 'start': offset}
        segments.append(('', False, False, None))

    def close_link():
        nonlocal active
        active['end'] = offset
        active['label'] = ''.join(s[0] for s in segments)[active['start']:offset]
        if not active['label'].strip():
            fail('Hyperlink has no visible label.', active['instruction'])
        links.append(active)
        active = None
        segments.append(('', False, False, None))

    def emit(text, run):
        nonlocal offset
        if state is not None and not state['display']:
            if text:
                fail('Visible text in a field instruction is ambiguous.', state['instruction'])
            return
        styled = Run(run, paragraph)
        segments.append((text, bool(styled.bold), bool(styled.italic), active['destination'] if active else None))
        offset += len(text)

    def walk(element, run=None):
        nonlocal state
        tag = element.tag
        if tag == W + 'fldSimple':
            instruction = element.get(W + 'instr', '')
            if state is not None:
                fail('Nested fields are unsupported.', instruction)
            open_link(field_destination(instruction, index), 'simple_field', instruction)
            for child in element:
                walk(child)
            close_link()
        elif tag == W + 'hyperlink':
            relation_id = element.get(R + 'id')
            anchor = element.get(W + 'anchor')
            if not relation_id:
                fail('Internal bookmark hyperlinks are unsupported; review required.')
            relation = paragraph.part.rels.get(relation_id)
            if relation is None or not relation.is_external or not relation.reltype.endswith('/hyperlink'):
                fail('Hyperlink relationship is missing or unsupported.')
            destination = relation.target_ref
            if anchor:
                destination = destination.split('#', 1)[0] + '#' + anchor
            open_link(destination, 'hyperlink')
            for child in element:
                walk(child)
            close_link()
        elif tag == W + 'fldChar':
            kind = element.get(W + 'fldCharType')
            if kind == 'begin':
                if state is not None or active is not None:
                    fail('Nested fields are unsupported.')
                state = {'instruction': '', 'display': False}
            elif kind == 'separate':
                if state is None or state['display']:
                    fail('Unbalanced field separator.')
                instruction = state['instruction']
                open_link(field_destination(instruction, index), 'complex_field', instruction)
                state['display'] = True
            elif kind == 'end':
                if state is None or not state['display']:
                    fail('Field has no supported cached display result.')
                close_link()
                state = None
            else:
                fail('Unknown field delimiter.')
        elif tag == W + 'instrText':
            if state is None or state['display']:
                fail('Field instruction outside the instruction range.')
            state['instruction'] += element.text or ''
        elif tag == W + 't':
            emit(element.text or '', run)
        elif tag in (W + 'tab', W + 'br', W + 'cr'):
            emit('\t' if tag == W + 'tab' else '\n', run)
        else:
            if tag == W + 'r':
                run = element
            for child in element:
                walk(child, run)

    walk(paragraph._p)
    if state is not None or active is not None:
        fail('Unclosed field or hyperlink.', state['instruction'] if state else '')
    if ''.join(s[0] for s in segments) != visible_text(paragraph):
        fail('Parsed text differs from the independent XML body-text inventory.')
    return segments, links


def normalized(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', text)).strip()


def prefix_length(text):
    return len(re.sub(r'\s+', ' ', unicodedata.normalize('NFC', text)).lstrip())


def verify_hyperlinks(paragraphs, output, pandoc):
    expected = [link for p in paragraphs for link in p.hyperlinks]
    report = {'source': len(expected), 'matched': 0, 'missing': [], 'mismatched': [],
              'unparsed_fields': [], 'source_links': expected}
    if not pandoc:
        report['error'] = 'Pandoc is unavailable; hyperlink fidelity was not checked.'
        return 'UNVERIFIED', report
    process = subprocess.run([pandoc, '-f', PANDOC_READER, '-t', 'json', str(output)], capture_output=True, text=True)
    if process.returncode:
        report['error'] = process.stderr.strip() or 'Pandoc failed to parse Markdown.'
        return 'FAIL', report
    ast = json.loads(process.stdout)
    chunks = []
    links = []
    offset = 0

    def add(text):
        nonlocal offset
        chunks.append(text)
        offset += len(text)

    def inlines(nodes):
        for node in nodes:
            kind = node['t']
            content = node.get('c')
            if kind == 'Str':
                add(content)
            elif kind in ('Space', 'SoftBreak', 'LineBreak'):
                add(' ')
            elif kind in ('Code', 'Math'):
                add(content[1])
            elif kind == 'Link':
                start = offset
                inlines(content[1])
                links.append({'start': start, 'end': offset, 'destination': content[2][0]})
            elif kind == 'Span':
                inlines(content[1])
            elif kind in ('Emph', 'Strong', 'Strikeout', 'SmallCaps', 'Superscript', 'Subscript'):
                inlines(content)
            elif kind == 'Quoted':
                add('“' if content[0]['t'] == 'DoubleQuote' else '‘')
                inlines(content[1])
                add('”' if content[0]['t'] == 'DoubleQuote' else '’')
            elif kind == 'RawInline' and content[0] == 'html':
                if re.fullmatch(r'<br\s*/?>', content[1], re.IGNORECASE):
                    add(' ')
                elif not re.fullmatch(r'<[^>]+>', content[1]):
                    add(html.unescape(content[1]))
            elif kind not in ('Note',):
                raise ValueError(f'Unsupported rendered inline node: {kind}')

    def blocks(nodes):
        for node in nodes:
            kind = node['t']
            content = node.get('c')
            if kind in ('Plain', 'Para'):
                inlines(content)
            elif kind == 'Header':
                inlines(content[2])
            elif kind == 'BulletList':
                for item in content:
                    blocks(item)
            elif kind == 'OrderedList':
                for item in content[1]:
                    blocks(item)
            elif kind == 'BlockQuote':
                blocks(content)
            elif kind == 'Div':
                blocks(content[1])
            elif kind == 'CodeBlock':
                add(content[1])
            elif kind not in ('HorizontalRule', 'Null', 'RawBlock'):
                raise ValueError(f'Unsupported rendered block node: {kind}')
            add('\n')

    try:
        blocks(ast['blocks'])
    except ValueError as exc:
        report['error'] = str(exc)
        return 'FAIL', report
    raw = ''.join(chunks)
    rendered = normalized(raw)
    for link in links:
        link['start'], link['end'] = prefix_length(raw[:link['start']]), prefix_length(raw[:link['end']])
    cursor = 0
    for paragraph in paragraphs:
        wanted = normalized(paragraph.text)
        found = rendered.find(wanted, cursor)
        if found < 0:
            report['error'] = f'Cannot locate source paragraph {paragraph.index} in rendered AST.'
            return 'FAIL', report
        cursor = found + len(wanted)
        for expected_link in paragraph.hyperlinks:
            label = expected_link['label']
            start = expected_link['start'] + len(label) - len(label.lstrip())
            end = expected_link['end'] - len(label) + len(label.rstrip())
            start = found + prefix_length(paragraph.text[:start])
            end = found + prefix_length(paragraph.text[:end])
            overlapping = [link for link in links if link['start'] < end and link['end'] > start]
            destination = expected_link['destination'].replace(' ', '%20').replace('>', '%3E')
            if not overlapping:
                report['missing'].append(expected_link)
                continue
            valid = all(link['destination'] == destination and start <= link['start'] and link['end'] <= end for link in overlapping)
            covered = start
            for link in sorted(overlapping, key=lambda item: item['start']):
                if rendered[covered:link['start']].strip():
                    valid = False
                covered = max(covered, link['end'])
            if rendered[covered:end].strip():
                valid = False
            if valid:
                report['matched'] += 1
            else:
                report['mismatched'].append({'source': expected_link, 'rendered': overlapping})
    return ('FAIL' if report['missing'] or report['mismatched'] else 'PASS'), report
