# Text fidelity rules

## Authority

The DOCX is the only source of visible wording. Existing Markdown is a formatting example only.

Preserve all source-language content exactly, including:

- capitalization and letter case;
- straight and curly quotation marks and apostrophes;
- punctuation, diacritics, combining marks, full-width characters, and Unicode direction marks;
- product names, company names, dates, numbers, section labels, email addresses, URLs, and URL query strings;
- deliberate spelling, grammar, and spacing inside sentences, even when they appear unusual;
- the order of paragraphs and list items;
- bold and italic emphasis where it carries legal meaning.

Do not translate, polish, correct, summarize, normalize typography, change quote styles, change case, add spaces beside URLs, remove repeated words, or repair legal wording.

Markdown escaping and invisible HTML anchors are allowed because they change syntax, not rendered wording. Leading indentation may use non-breaking-space entities. RTL section numbers may be wrapped in `<span dir="ltr">...</span>` as long as every visible character remains unchanged.

Do not add a visible space after a URL merely to stop the URL from absorbing the following text. Use an explicit Markdown link destination, such as `[visible URL](<destination>)`, so the closing `)` forms the syntax boundary while the rendered wording remains identical to Word. Preserve a visible space only when that space exists in the DOCX.

Prefer `**bold**` and `_italic_` when their Markdown boundaries are unambiguous. When emphasis directly touches a CJK character or another word character, use equivalent inline HTML such as `<strong>...</strong>` or `<em>...</em>` to prevent delimiter characters from leaking into rendered text.

## Hyperlinks and Word fields

Read hyperlinks stored as `w:hyperlink`, `w:fldSimple`, and complex `HYPERLINK` fields (`begin`, instruction fragments, `separate`, cached display content, `end`). Use the stored destination even when the visible text is a region label or e-mail address rather than a URL.

Preserve the full destination, including trailing slashes, query strings, `mailto:` and external bookmark locations supplied by `w:anchor` or the field's `\l` switch. Word's display text is authoritative; do not substitute the destination for it. Do not evaluate or refresh fields.

Keep existing leading/trailing label whitespace outside Markdown link brackets, without adding or deleting visible spacing. Track boundaries at the XML text-node level: a field delimiter and legal text can occur within the same Word run. Preserve emphasis changes inside links.

Cached display text inside simple fields must enter the body-text inventory. Inventory body text directly from XML text, tab and break nodes independently of hyperlink rendering; `paragraph.text` alone is insufficient.

Internal bookmark links, nested fields, non-HYPERLINK fields, incomplete fields, ambiguous instructions and unsupported switches fail with `unparsed_fields` diagnostics. Opening-window and ScreenTip switches do not change the Markdown destination; those UI behaviours are not reproduced.

## Source defects

The converter flags, but never repairs, a hyperlink whose display text touches an adjacent letter in the source, such as a region label followed immediately by the next word. These warnings appear in the report's `warnings` list. Record each one in a source-defect list, have the document owner confirm it, and apply any agreed wording or spacing change as a separate, logged step after conversion. Have the owner correct the DOCX as well, otherwise the next conversion reintroduces the defect.

## Structure gate

A text and hyperlink `PASS` proves wording and link preservation only. It says nothing about indentation or rendered alignment. Before delivery, also check `structure` in the report: the continuation-paragraph count and the flattened list items must match the approved structure for that document template, and `structure.warnings` must be empty. Report text fidelity, hyperlink fidelity, Markdown structure, platform file hashes, and in-app display as five separate results; none substitutes for another.

## Verification gate

For each output, the converter must:

1. inventory every non-empty source paragraph from XML in document order, including supported field display text;
2. render the generated Markdown to plain text with Pandoc;
3. normalize only Unicode composition and whitespace used for layout;
4. find every complete source paragraph, with original case and punctuation, in the rendered output in the same order;
5. parse the generated Markdown with Pandoc into actual link nodes and locate each source paragraph in the rendered text;
6. compare every source hyperlink's display-text range and complete destination at that paragraph position, allowing emphasis to split a link into consecutive fragments with the same target;
7. fail the file if any paragraph is missing or any hyperlink is missing, targets the wrong destination, links the wrong text, or remains unparsed.

Do not verify links by searching Markdown URL strings: code literals and links attached to different words must not satisfy the check. The Pandoc reader disables bare-URL autolinking for verification so it checks the explicit links rather than generating nested links from visible URL labels.

Reports include separate `text_fidelity_status` and `hyperlink_fidelity_status`, plus a combined `fidelity_status`. Each hyperlink records its paragraph index, link index, source kind/instruction, display text, character range and destination. Success requires both checks to pass and empty missing/mismatched/unparsed diagnostics. Failed files retain their available diagnostics in the batch report.

Whitespace normalization may collapse tabs, line breaks, ordinary spaces, and non-breaking spaces. It must not normalize letters, punctuation, quotation marks, apostrophes, diacritics, digits, or URLs.

## Unsupported content

Tracked changes, text boxes, headers or footers containing legal text, referenced footnotes or endnotes, drawings with text, equations, and complex tables can hide content from ordinary paragraph extraction. Do not silently convert them. Report the feature and stop until it is reviewed or handled with a format-specific path.

Word review comments are annotations rather than visible legal body text. Exclude them from Markdown, count them in the conversion report, and do not treat their wording as approved agreement text. Tracked insertions or deletions still require a stop.

## Evidence boundary

A `PASS` proves that the converter preserved supported source paragraphs and hyperlink text/destination ranges in order and produced the expected Markdown structure. It does not prove the source text is legally approved, linguistically correct, current, or configured in the Xiaomi Home platform, or that every third-party Markdown renderer behaves identically.
