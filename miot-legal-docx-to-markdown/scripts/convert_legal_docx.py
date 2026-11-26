#!/usr/bin/env python3
"""Convert Mi Home legal DOCX files to text-faithful Markdown."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from docx import Document
from legal_hyperlinks import (
    HyperlinkError, PANDOC_READER, parse_paragraph, visible_text, verify_hyperlinks,
)


W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
RTL_RE = re.compile(r"[\u0590-\u08ff]")
URL_RE = re.compile(r"https?://[^\s<>\u060c\u061b\u061f\u06d4\u3001\u3002\uff0c\uff1b\uff1a\uff01\uff1f]+")
HEADING_STYLE_RE = re.compile(r"^Heading\s+(\d+)$", re.IGNORECASE)
TOP_NUMBER_RE = re.compile(r"^\s*(\d+)\.(?!\s*\d+\.)\s*(\S.*)$", re.DOTALL)
SUB_NUMBER_RE = re.compile(r"^\s*(\d+)\.\s*(\d+)\.\s*(\S.*)$", re.DOTALL)
SUBCLAUSE_NUMBER_RE = re.compile(r"^\s*\d+\.\d+(?:\.\d+)*\.?\s+\S", re.DOTALL)
CHINESE_NUMBER_RE = re.compile(r"^\s*([一二三四五六七八九十百]+、)(.*)$", re.DOTALL)
ROMAN_TOP_RE = re.compile(r"^\s*([IVXLCDM]+)\.\s+(\S.*)$", re.IGNORECASE | re.DOTALL)
ROMAN_SUB_RE = re.compile(r"^\s*\(([IVXLCDM]+)\)\s*(\S.*)$", re.IGNORECASE | re.DOTALL)


class ConversionError(RuntimeError):
    def __init__(self, message, report=None):
        super().__init__(message)
        self.report = report or {}


@dataclass
class ParagraphInfo:
    index: int
    paragraph: object
    text: str
    style_name: str
    outline_level: int | None
    num_id: int | None
    list_level: int
    bold_ratio: float
    heading_level: int | None = None
    toc_id: str | None = None
    toc_prefix: str = ""
    is_toc_item: bool = False
    is_toc_title: bool = False
    segments: list | None = None
    hyperlinks: list | None = None
    indent_left: int | None = None
    is_list_continuation: bool = False
    suppress_list_marker: bool = False


def normalize_visible(text: str) -> str:
    text = unicodedata.normalize("NFC", text).replace("\u00a0", " ")
    return re.sub(r"\s+", " ", text).strip()


def sha256_text(items: Iterable[str]) -> str:
    payload = "\n".join(normalize_visible(item) for item in items if normalize_visible(item))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def paragraph_outline_level(paragraph) -> int | None:
    p_pr = paragraph._p.pPr
    if p_pr is None:
        return None
    node = p_pr.find(W_NS + "outlineLvl")
    if node is None:
        return None
    value = node.get(W_NS + "val")
    return int(value) if value is not None else None


def paragraph_numbering(paragraph) -> tuple[int | None, int]:
    p_pr = paragraph._p.pPr
    if p_pr is None or p_pr.numPr is None:
        return None, 0
    num_id = p_pr.numPr.numId
    level = p_pr.numPr.ilvl
    return (
        int(num_id.val) if num_id is not None else None,
        int(level.val) if level is not None else 0,
    )


def paragraph_bold_ratio(paragraph) -> float:
    total = 0
    bold = 0
    for run in paragraph.runs:
        size = len(run.text.strip())
        total += size
        if run.bold:
            bold += size
    return bold / total if total else 0.0


def classify_document(path: Path, requested: str) -> str:
    if requested != "auto":
        return requested
    lowered = path.name.casefold()
    if "隐私" in lowered or "privacy" in lowered:
        return "privacy"
    if "用户协议" in lowered or "agreement" in lowered or "service agreement" in lowered:
        return "agreement"
    raise ConversionError(
        f"Cannot classify document type from filename: {path.name}. "
        "Use --document-type privacy or --document-type agreement."
    )


def check_unsupported(document, path: Path) -> list[str]:
    root = document.element
    unsupported = []
    warnings = []
    checks = {
        "tracked insertions": ".//w:ins",
        "tracked deletions": ".//w:del",
        "text boxes": ".//w:txbxContent",
        "drawings": ".//w:drawing",
        "embedded objects": ".//w:object",
        "equations": './/*[local-name()="oMath"]',
        "alternate content": './/*[local-name()="AlternateContent"]',
    }
    for label, xpath in checks.items():
        if root.xpath(xpath):
            unsupported.append(label)
    if root.xpath(".//w:footnoteReference"):
        unsupported.append("referenced footnotes")
    if root.xpath(".//w:endnoteReference"):
        unsupported.append("referenced endnotes")
    comment_count = len(root.xpath(".//w:commentReference"))
    if comment_count:
        warnings.append(
            f"Excluded {comment_count} Word review comment(s); comments are annotations, not visible legal body text."
        )
    if document.tables:
        unsupported.append("tables")
    for section in document.sections:
        header_text = " ".join(p.text.strip() for p in section.header.paragraphs if p.text.strip())
        footer_text = " ".join(p.text.strip() for p in section.footer.paragraphs if p.text.strip())
        if header_text:
            unsupported.append("non-empty headers")
        if footer_text:
            unsupported.append("non-empty footers")
    if unsupported:
        raise ConversionError(
            f"{path.name}: unsupported content requires review: {', '.join(sorted(set(unsupported)))}"
        )
    return warnings


def collect_paragraphs(document) -> list[ParagraphInfo]:
    result = []
    for index, paragraph in enumerate(document.paragraphs):
        text = visible_text(paragraph)
        segments, hyperlinks = parse_paragraph(paragraph, index)
        if not text.strip():
            continue
        num_id, list_level = paragraph_numbering(paragraph)
        result.append(
            ParagraphInfo(
                index=index,
                paragraph=paragraph,
                text=text,
                style_name=paragraph.style.name or "",
                outline_level=paragraph_outline_level(paragraph),
                num_id=num_id,
                list_level=list_level,
                bold_ratio=paragraph_bold_ratio(paragraph),
                segments=segments,
                hyperlinks=hyperlinks,
            )
        )
    if not result:
        raise ConversionError("The DOCX contains no non-empty body paragraphs.")
    return result


INDENT_TOLERANCE_TWIPS = 60


def _ind_left(node) -> int | None:
    if node is None:
        return None
    ind = node.find(W_NS + "ind")
    if ind is None:
        return None
    value = ind.get(W_NS + "left")
    if value is None:
        value = ind.get(W_NS + "start")
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def style_indent_left(document, style_name: str) -> int | None:
    """Resolve a paragraph style's left indent, following basedOn inheritance."""
    try:
        styles = document.styles.element
    except AttributeError:
        return None
    by_id = {}
    for node in styles.findall(W_NS + "style"):
        name_node = node.find(W_NS + "name")
        style_id = node.get(W_NS + "styleId")
        if style_id:
            by_id[style_id] = node
        if name_node is not None and name_node.get(W_NS + "val") == style_name:
            by_id.setdefault("__match__", node)
    node = by_id.get("__match__") or by_id.get(style_name) or by_id.get(style_name.replace(" ", ""))
    seen = set()
    while node is not None and id(node) not in seen:
        seen.add(id(node))
        left = _ind_left(node.find(W_NS + "pPr"))
        if left is not None:
            return left
        based = node.find(W_NS + "basedOn")
        node = by_id.get(based.get(W_NS + "val")) if based is not None else None
    return None


def numbering_indent_left(document, num_id: int | None, level: int) -> int | None:
    """Left indent of a numbering level, i.e. where its item text starts."""
    if num_id is None:
        return None
    try:
        root = document.part.numbering_part.element
    except (AttributeError, KeyError):
        return None
    num = next(
        (n for n in root.findall(W_NS + "num") if n.get(W_NS + "numId") == str(num_id)),
        None,
    )
    if num is None:
        return None
    abstract = num.find(W_NS + "abstractNumId")
    if abstract is None:
        return None
    abstract_node = next(
        (
            n for n in root.findall(W_NS + "abstractNum")
            if n.get(W_NS + "abstractNumId") == abstract.get(W_NS + "val")
        ),
        None,
    )
    if abstract_node is None:
        return None
    lvl = next(
        (n for n in abstract_node.findall(W_NS + "lvl") if n.get(W_NS + "ilvl") == str(level)),
        None,
    )
    return _ind_left(lvl.find(W_NS + "pPr")) if lvl is not None else None


def effective_indent_left(document, info: ParagraphInfo, style_cache: dict) -> int:
    """Where this paragraph's text starts horizontally, in twips."""
    direct = _ind_left(info.paragraph._p.pPr)
    if direct is not None:
        return direct
    if info.num_id is not None:
        from_numbering = numbering_indent_left(document, info.num_id, info.list_level)
        if from_numbering is not None:
            return from_numbering
    if info.style_name not in style_cache:
        style_cache[info.style_name] = style_indent_left(document, info.style_name)
    return style_cache[info.style_name] or 0


def mark_list_continuations(document, paragraphs: list[ParagraphInfo]) -> list[str]:
    """Attach un-numbered but indented paragraphs to the list item above them.

    Word keeps such paragraphs aligned with the item text. Rendering them as
    plain top-level paragraphs under a Markdown list item would put the item
    marker and its own body at different indentation levels, which is the
    misalignment reported against privacy policy section 9.
    """
    style_cache: dict = {}
    warnings: list[str] = []
    open_item: ParagraphInfo | None = None
    open_item_left = 0
    for info in paragraphs:
        info.indent_left = effective_indent_left(document, info, style_cache)
        if info.heading_level or info.is_toc_item or info.is_toc_title:
            open_item = None
            continue
        if info.num_id is not None:
            open_item = info
            open_item_left = info.indent_left
            continue
        if (
            open_item is not None
            and open_item_left > 0
            and info.indent_left >= open_item_left - INDENT_TOLERANCE_TWIPS
        ):
            info.is_list_continuation = True
            open_item.suppress_list_marker = True
            continue
        open_item = None
    for info in paragraphs:
        if info.suppress_list_marker:
            fmt, _ = numbering_format(document, info.num_id, info.list_level)
            if fmt != "bullet":
                info.suppress_list_marker = False
                warnings.append(
                    "numbered list item has indented continuation paragraphs; "
                    f"review rendered alignment: {info.text[:80]!r}"
                )
    return warnings


LINK_ADJACENCY_RE = re.compile(r"\w", re.UNICODE)


def check_link_adjacency(paragraphs: list[ParagraphInfo]) -> list[str]:
    """Flag hyperlink display text that touches a letter in the source text.

    Missing separators such as "Switzerlandcompetent authorities" come from the
    DOCX and must be confirmed with the document owner, never silently fixed.
    """
    warnings: list[str] = []
    for info in paragraphs:
        for link in info.hyperlinks or []:
            start = link.get("start")
            end = link.get("end")
            if start is None or end is None:
                continue
            text = info.text
            raw_label = link.get("label") or ""
            display = raw_label.strip()
            if not display:
                continue
            start += len(raw_label) - len(raw_label.lstrip())
            end -= len(raw_label) - len(raw_label.rstrip())
            before = text[start - 1] if start > 0 else ""
            after = text[end] if 0 <= end < len(text) else ""
            touching = []
            if before and LINK_ADJACENCY_RE.match(before) and LINK_ADJACENCY_RE.match(display[0]):
                touching.append("before")
            if after and LINK_ADJACENCY_RE.match(after) and LINK_ADJACENCY_RE.match(display[-1]):
                touching.append("after")
            if touching:
                warnings.append(
                    "source hyperlink text touches adjacent word characters "
                    f"({'/'.join(touching)}); confirm with the document owner: "
                    f"{text[max(0, start - 20):end + 20]!r}"
                )
    return warnings


def infer_heading_level(info: ParagraphInfo, document_type: str, is_title: bool) -> int | None:
    if is_title:
        return 1
    style_match = HEADING_STYLE_RE.match(info.style_name)
    if style_match:
        source_level = int(style_match.group(1))
        if source_level == 1:
            return 3
        return min(6, max(3, source_level))
    if document_type == "agreement":
        if SUBCLAUSE_NUMBER_RE.match(info.text):
            return None
        if TOP_NUMBER_RE.match(info.text) and info.bold_ratio >= 0.7:
            return 3
        if info.outline_level == 0 and info.bold_ratio >= 0.7:
            return 3
        return None
    if info.num_id is not None:
        return None
    if ROMAN_SUB_RE.match(info.text) and (info.bold_ratio >= 0.7 or info.outline_level is not None):
        return 4
    if ROMAN_TOP_RE.match(info.text):
        return 3
    if SUB_NUMBER_RE.match(info.text) and (info.bold_ratio >= 0.7 or info.outline_level is not None):
        return 4
    if TOP_NUMBER_RE.match(info.text) and len(info.text) <= 180:
        return 3
    if (
        info.bold_ratio >= 0.95
        and len(info.text) <= 160
        and (info.text.isupper() or info.text.rstrip().endswith(":"))
    ):
        return 3
    return None


def strip_section_prefix(text: str) -> str:
    value = normalize_visible(text)
    value = re.sub(r"^\d+\.\s*\d+\.\s*", "", value)
    value = re.sub(r"^\d+\.\s*", "", value)
    value = re.sub(r"^[一二三四五六七八九十百]+、\s*", "", value)
    value = re.sub(r"^[IVXLCDM]+\.\s*", "", value, flags=re.IGNORECASE)
    return value


def match_toc_to_headings(paragraphs: list[ParagraphInfo]) -> None:
    heading_positions = [
        i for i, p in enumerate(paragraphs)
        if p.heading_level in (3, 4) and not p.is_toc_title and not p.is_toc_item
    ]
    cursor = 0
    for item in [p for p in paragraphs if p.is_toc_item]:
        wanted = strip_section_prefix(item.text)
        found = None
        for offset in range(cursor, len(heading_positions)):
            candidate = paragraphs[heading_positions[offset]]
            if strip_section_prefix(candidate.text).casefold() == wanted.casefold():
                found = offset
                break
        if found is None:
            raise ConversionError(
                f"Cannot match contents entry to body heading without changing text: {item.text!r}"
            )
        paragraphs[heading_positions[found]].toc_id = item.toc_id
        cursor = found + 1


def detect_toc(paragraphs: list[ParagraphInfo], document_type: str) -> None:
    if document_type != "privacy":
        return
    for position, info in enumerate(paragraphs):
        info.heading_level = infer_heading_level(info, document_type, position == 0)

    roman_positions = [
        i
        for i, p in enumerate(paragraphs)
        if p.heading_level == 3 and ROMAN_TOP_RE.match(p.text)
    ]
    for start_offset, start in enumerate(roman_positions):
        candidates = [start]
        candidate_labels = {strip_section_prefix(paragraphs[start].text).casefold()}
        for position in roman_positions[start_offset + 1:]:
            label = strip_section_prefix(paragraphs[position].text).casefold()
            if position != candidates[-1] + 1 or label in candidate_labels:
                break
            candidates.append(position)
            candidate_labels.add(label)
        later = {
            strip_section_prefix(paragraphs[position].text).casefold()
            for position in roman_positions[start_offset + len(candidates):]
        }
        if len(candidates) < 3 or not all(
            strip_section_prefix(paragraphs[position].text).casefold() in later
            for position in candidates
        ):
            continue
        title_position = candidates[0] - 1
        if title_position < 1:
            continue
        paragraphs[title_position].is_toc_title = True
        paragraphs[title_position].heading_level = 3
        for number, position in enumerate(candidates, 1):
            item = paragraphs[position]
            item.is_toc_item = True
            item.toc_id = f"target{number}"
            match = ROMAN_TOP_RE.match(item.text)
            item.toc_prefix = f"{match.group(1)}. " if match else ""
        match_toc_to_headings(paragraphs)
        return

    first_numeric_body = next(
        (
            i for i, p in enumerate(paragraphs[1:], 1)
            if p.heading_level in (3, 4)
            and (TOP_NUMBER_RE.match(p.text) or SUB_NUMBER_RE.match(p.text))
        ),
        None,
    )
    if first_numeric_body is not None:
        numbered = [i for i in range(1, first_numeric_body) if paragraphs[i].num_id is not None]
        if len(numbered) >= 3:
            start, end = min(numbered), max(numbered)
            previous = start - 1
            if previous >= 1:
                paragraphs[previous].is_toc_title = True
                paragraphs[previous].heading_level = 3
            main = 0
            sub = 0
            for i in range(start, end + 1):
                item = paragraphs[i]
                if item.num_id is None:
                    continue
                item.is_toc_item = True
                if item.list_level == 0:
                    main += 1
                    sub = 0
                    item.toc_id = f"target{main}"
                    item.toc_prefix = f"{main}. "
                else:
                    sub += 1
                    item.toc_id = f"target{main}_{sub}"
                    item.toc_prefix = f"{main}.{sub} "
            match_toc_to_headings(paragraphs)
            return

    heading_positions = [i for i, p in enumerate(paragraphs) if p.heading_level in (3, 4)]
    for toc_title_pos in heading_positions:
        next_heading = next((i for i in heading_positions if i > toc_title_pos), len(paragraphs))
        candidates = list(range(toc_title_pos + 1, next_heading))
        if len(candidates) < 3:
            continue
        later = {
            strip_section_prefix(paragraphs[i].text)
            for i in heading_positions if i >= next_heading
        }
        if sum(strip_section_prefix(paragraphs[i].text) in later for i in candidates) < 3:
            continue
        paragraphs[toc_title_pos].is_toc_title = True
        number = 0
        for i in candidates:
            if strip_section_prefix(paragraphs[i].text) not in later:
                continue
            number += 1
            item = paragraphs[i]
            item.is_toc_item = True
            item.toc_id = f"target{number}"
            match = CHINESE_NUMBER_RE.match(item.text)
            item.toc_prefix = match.group(1) if match else ""
        match_toc_to_headings(paragraphs)
        return


def escape_markdown_text(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    for char in ("\\", "*", "_", "[", "]"):
        text = text.replace(char, "\\" + char)
    return text.replace("\n", "<br>\n")


def markdown_url(url: str) -> str:
    return url.replace(" ", "%20").replace(">", "%3E")


def linkify_visible_urls(text: str) -> str:
    parts = []
    cursor = 0
    terminal_punctuation = ".,;:!?，。；：！？、»”’)]}،؛؟۔"
    for match in URL_RE.finditer(text):
        parts.append(escape_markdown_text(text[cursor:match.start()]))
        raw = match.group(0)
        trailing = ""
        while raw and raw[-1] in terminal_punctuation:
            trailing = raw[-1] + trailing
            raw = raw[:-1]
        label = escape_markdown_text(raw)
        parts.append(f"[{label}](<{markdown_url(raw)}>)")
        parts.append(escape_markdown_text(trailing))
        cursor = match.end()
    parts.append(escape_markdown_text(text[cursor:]))
    return "".join(parts)


def whitespace_to_entities(text: str) -> str:
    return "".join("&nbsp;" if char == " " else "<br>\n" if char == "\n" else char for char in text)


def render_unstyled_segment(text: str, url: str | None) -> str:
    if url:
        core = text.strip()
        if not core:
            return whitespace_to_entities(text)
        leading = text[:len(text) - len(text.lstrip())]
        trailing = text[len(text.rstrip()):]
        return (
            whitespace_to_entities(leading)
            + f"[{escape_markdown_text(core)}](<{markdown_url(url)}>)"
            + whitespace_to_entities(trailing)
        )
    return linkify_visible_urls(text)


def emphasis_boundary_is_safe(char: str | None) -> bool:
    """Return whether a Markdown emphasis delimiter can safely touch char."""
    return char is None or char.isspace() or not char.isalnum()


def render_style_group(
    group: list[tuple[str, bool, bool, str | None]],
    previous_char: str | None = None,
    next_char: str | None = None,
) -> str:
    full_text = "".join(item[0] for item in group)
    if not full_text.strip():
        return whitespace_to_entities(full_text)
    leading = re.match(r"^\s*", full_text).group(0)
    trailing = re.search(r"\s*$", full_text).group(0)
    leading_left = len(leading)
    trailing_left = len(trailing)
    trimmed = []
    for text, bold, italic, url in group:
        take = min(leading_left, len(text))
        text = text[take:]
        leading_left -= take
        trimmed.append([text, bold, italic, url])
    for item in reversed(trimmed):
        take = min(trailing_left, len(item[0]))
        if take:
            item[0] = item[0][:-take]
            trailing_left -= take
    core_source = "".join(item[0] for item in trimmed)
    core = "".join(render_unstyled_segment(item[0], item[3]) for item in trimmed if item[0])
    bold, italic = group[0][1], group[0][2]
    if not any(char.isalnum() for char in core_source):
        bold = italic = False
    if core:
        left_neighbor = leading[-1] if leading else previous_char
        right_neighbor = trailing[0] if trailing else next_char
        markdown_safe = (
            emphasis_boundary_is_safe(left_neighbor)
            and emphasis_boundary_is_safe(right_neighbor)
        )
        if markdown_safe:
            if bold and italic:
                core = f"***{core}***"
            elif bold:
                core = f"**{core}**"
            elif italic:
                core = f"_{core}_"
        else:
            # CommonMark emphasis delimiters are ambiguous next to CJK and other
            # word characters. Inline HTML preserves the exact visible wording.
            if bold and italic:
                core = f"<strong><em>{core}</em></strong>"
            elif bold:
                core = f"<strong>{core}</strong>"
            elif italic:
                core = f"<em>{core}</em>"
    return whitespace_to_entities(leading) + core + whitespace_to_entities(trailing)


def render_inline(info: ParagraphInfo, suppress_full_bold: bool = False) -> str:
    segments = info.segments
    if segments is None:
        segments, _ = parse_paragraph(info.paragraph, info.index)
    merged = []
    for segment in segments:
        if merged and merged[-1][1:] == segment[1:]:
            merged[-1] = (merged[-1][0] + segment[0],) + merged[-1][1:]
        else:
            merged.append(segment)
    normalized = []
    for text, bold, italic, url in merged:
        if not text:
            continue
        if suppress_full_bold and info.bold_ratio >= 0.8:
            bold = False
        normalized.append((text, bold, italic, url))
    groups = []
    for segment in normalized:
        if groups and groups[-1][0][1:3] == segment[1:3]:
            groups[-1].append(segment)
        else:
            groups.append([segment])
    rendered_groups = []
    for index, group in enumerate(groups):
        previous_char = groups[index - 1][-1][0][-1] if index > 0 else None
        next_char = groups[index + 1][0][0][0] if index + 1 < len(groups) else None
        rendered_groups.append(render_style_group(group, previous_char, next_char))
    return "".join(rendered_groups).rstrip()


def rtl_heading_text(rendered: str, source_text: str) -> str:
    if not RTL_RE.search(source_text):
        return rendered
    match = re.match(r"^(\d+\.\s*\d*\.?)(\s+)(.*)$", rendered, re.DOTALL)
    if not match:
        return rendered
    return f'<span dir="ltr">{match.group(1)}</span>{match.group(2)}{match.group(3)}'


def numbering_format(document, num_id: int, level: int) -> tuple[str, int]:
    root = document.part.numbering_part.element
    nums = [
        node for node in root.findall(W_NS + "num")
        if node.get(W_NS + "numId") == str(num_id)
    ]
    if not nums:
        return "decimal", 1
    num = nums[0]
    abstract_id_node = num.find(W_NS + "abstractNumId")
    if abstract_id_node is None:
        return "decimal", 1
    abstract_id = abstract_id_node.get(W_NS + "val")
    abstracts = [
        node for node in root.findall(W_NS + "abstractNum")
        if node.get(W_NS + "abstractNumId") == abstract_id
    ]
    if not abstracts:
        return "decimal", 1
    levels = [
        node for node in abstracts[0].findall(W_NS + "lvl")
        if node.get(W_NS + "ilvl") == str(level)
    ]
    if not levels:
        return "decimal", 1
    fmt_node = levels[0].find(W_NS + "numFmt")
    start_node = levels[0].find(W_NS + "start")
    override_value = None
    for override in num.findall(W_NS + "lvlOverride"):
        if override.get(W_NS + "ilvl") != str(level):
            continue
        start_override = override.find(W_NS + "startOverride")
        if start_override is not None:
            override_value = start_override.get(W_NS + "val")
            break
    start_value = override_value or (start_node.get(W_NS + "val") if start_node is not None else "1")
    fmt_value = fmt_node.get(W_NS + "val") if fmt_node is not None else "decimal"
    return fmt_value, int(start_value)


def render_document(document, paragraphs: list[ParagraphInfo], document_type: str) -> tuple[str, dict]:
    for position, info in enumerate(paragraphs):
        if info.heading_level is None:
            info.heading_level = infer_heading_level(info, document_type, position == 0)
    detect_toc(paragraphs, document_type)
    structure_warnings = mark_list_continuations(document, paragraphs)

    counters: dict[tuple[int, int], int] = {}
    lines = []
    heading_count = 0
    anchor_count = 0
    for info in paragraphs:
        if info.is_toc_item:
            source_text = info.text
            if info.toc_prefix and source_text.startswith(info.toc_prefix):
                label = source_text[len(info.toc_prefix):]
                prefix = escape_markdown_text(info.toc_prefix)
            else:
                label = source_text
                prefix = info.toc_prefix
            link = f"[{escape_markdown_text(label.strip())}](#{info.toc_id})"
            indent = "   " if "_" in (info.toc_id or "") else ""
            lines.append(f"{indent}{prefix}{link}")
            continue

        if info.heading_level:
            heading_count += 1
            content = render_inline(info, suppress_full_bold=True).strip()
            content = rtl_heading_text(content, info.text)
            if info.toc_id:
                content += f'<a id="{info.toc_id}"></a>'
                anchor_count += 1
            lines.append("#" * info.heading_level + " " + content)
            continue

        content = render_inline(info)
        if info.num_id is not None and not info.suppress_list_marker:
            fmt, start = numbering_format(document, info.num_id, info.list_level)
            if fmt == "bullet":
                prefix = "  " * info.list_level + "- "
            else:
                key = (info.num_id, info.list_level)
                counters[key] = counters.get(key, start - 1) + 1
                prefix = "    " * info.list_level + f"{counters[key]}. "
            lines.append(prefix + content.strip())
        else:
            lines.append(content)

    markdown = "\n\n".join(lines).rstrip() + "\n"
    return markdown, {
        "headings": heading_count,
        "anchors": anchor_count,
        "paragraphs": len(paragraphs),
        "structure": {
            "list_continuation_paragraphs": sum(1 for p in paragraphs if p.is_list_continuation),
            "flattened_list_items": [
                p.text[:120] for p in paragraphs if p.suppress_list_marker
            ],
            "warnings": structure_warnings,
        },
    }


def find_pandoc() -> str | None:
    pandoc = shutil.which("pandoc")
    if not pandoc:
        try:
            import pypandoc

            pandoc = pypandoc.get_pandoc_path()
        except (ImportError, OSError):
            pass
    return pandoc


def verify_with_pandoc(source_texts: list[str], output: Path) -> tuple[str, str | None]:
    pandoc = find_pandoc()
    if not pandoc:
        return "UNVERIFIED", "Pandoc is unavailable; rendered-text fidelity was not checked."
    process = subprocess.run(
        [pandoc, "-f", PANDOC_READER, "-t", "plain", "--wrap=none", str(output)],
        capture_output=True,
        text=True,
    )
    if process.returncode != 0:
        return "FAIL", process.stderr.strip() or "Pandoc failed to render Markdown."
    rendered = normalize_visible(process.stdout)
    cursor = 0
    for index, source in enumerate(source_texts, 1):
        wanted = normalize_visible(source)
        if not wanted:
            continue
        found = rendered.find(wanted, cursor)
        if found < 0:
            return (
                "FAIL",
                f"Source paragraph {index} was not found unchanged in rendered Markdown: {wanted[:160]!r}",
            )
        cursor = found + len(wanted)
    return "PASS", None


def convert_one(source: Path, output: Path, document_type: str, overwrite: bool) -> dict:
    if output.exists() and not overwrite:
        raise ConversionError(
            f"Output already exists: {output}. Use --overwrite only with explicit authorization."
        )
    document = Document(source)
    warnings = check_unsupported(document, source)
    try:
        paragraphs = collect_paragraphs(document)
    except HyperlinkError as exc:
        raise ConversionError(str(exc), {
            "fidelity_status": "FAIL", "text_fidelity_status": "UNVERIFIED",
            "hyperlink_fidelity_status": "FAIL",
            "hyperlinks": {"unparsed_fields": exc.issues, "missing": [], "mismatched": []},
        }) from exc
    kind = classify_document(source, document_type)
    markdown, stats = render_document(document, paragraphs, kind)
    warnings = warnings + stats["structure"]["warnings"] + check_link_adjacency(paragraphs)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(markdown, encoding="utf-8", newline="\n")
    text_status, error = verify_with_pandoc([p.text for p in paragraphs], output)
    link_status, link_report = verify_hyperlinks(paragraphs, output, find_pandoc())
    status = "PASS" if text_status == link_status == "PASS" else "FAIL"
    if link_status != "PASS" and not error:
        error = link_report.get("error") or (
            f"Hyperlink verification failed: {len(link_report['missing'])} missing, "
            f"{len(link_report['mismatched'])} mismatched."
        )
    result = {
        "source": str(source.resolve()),
        "output": str(output.resolve()),
        "document_type": kind,
        "source_paragraph_sha256": sha256_text(p.text for p in paragraphs),
        "fidelity_status": status,
        "text_fidelity_status": text_status,
        "hyperlink_fidelity_status": link_status,
        "hyperlinks": link_report,
        "warnings": warnings,
        **stats,
    }
    if error:
        result["error"] = error
    if status != "PASS":
        raise ConversionError(f"{source.name}: fidelity verification {status}: {error}", result)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="A DOCX file or directory containing DOCX files")
    parser.add_argument("--output", type=Path, help="Output Markdown path for one input file")
    parser.add_argument("--output-root", type=Path, help="Output root for a directory input")
    parser.add_argument("--report", type=Path, required=True, help="JSON conversion report path")
    parser.add_argument(
        "--document-type",
        choices=("auto", "privacy", "agreement"),
        default="auto",
    )
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.source.expanduser().resolve()
    if not source.exists():
        print(f"ERROR: source does not exist: {source}", file=sys.stderr)
        return 2
    if source.is_file():
        if source.suffix.casefold() != ".docx":
            print("ERROR: single-file input must be a .docx file", file=sys.stderr)
            return 2
        output = (args.output or source.with_suffix(".md")).expanduser().resolve()
        jobs = [(source, output)]
    else:
        if args.output_root is None:
            print("ERROR: --output-root is required for directory input", file=sys.stderr)
            return 2
        output_root = args.output_root.expanduser().resolve()
        sources = sorted(
            p for p in source.rglob("*.docx")
            if not p.name.startswith("~$")
            and not any(part.startswith(".") for part in p.relative_to(source).parts)
        )
        jobs = [
            (path, output_root / path.relative_to(source).with_suffix(".md"))
            for path in sources
        ]
    results = []
    failures = []
    for input_path, output_path in jobs:
        try:
            results.append(convert_one(input_path, output_path, args.document_type, args.overwrite))
            print(f"PASS {input_path} -> {output_path}")
        except Exception as exc:
            failures.append(
                {**getattr(exc, "report", {}), "source": str(input_path), "output": str(output_path), "error": str(exc)}
            )
            print(f"FAIL {input_path}: {exc}", file=sys.stderr)
    report = {
        "source": str(source),
        "converted": len(results),
        "failed": len(failures),
        "fidelity_status": (
            "PASS"
            if jobs and not failures and all(r["fidelity_status"] == "PASS" for r in results)
            else "FAIL"
        ),
        "files": results,
        "failures": failures,
    }
    report_path = args.report.expanduser().resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({key: report[key] for key in ("converted", "failed", "fidelity_status")}, ensure_ascii=False))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
