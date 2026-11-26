# Privacy policy Markdown format

Use this structure when converting a privacy policy. The exact wording and section count always come from the DOCX.

## Structure

1. The first non-empty Word paragraph becomes one level-1 heading: `# <original title>`.
2. Introductory effective-date and explanatory paragraphs remain ordinary paragraphs.
3. An overview or contents label becomes a level-3 heading when the source presents it as a heading or bold standalone label.
4. Contents entries become links to stable body anchors. Preserve the source entry text exactly.
5. Top-level body sections use level-3 headings; subsections use level-4 headings; deeper source headings may continue with level 5 or 6.
6. Append an invisible anchor to every body heading referenced by the contents, for example `<a id="target3"></a>` or `<a id="target3_2"></a>`.
7. Word bullet lists become `-` lists. Word decimal lists remain decimal lists. Preserve nested list depth.
8. A Word list item whose own body continues in following un-numbered paragraphs is rendered without its `-` marker, so the item text and its continuation paragraphs keep the single shared indentation they have in Word. The converter detects this from the paragraph's effective left indent, not from a product template. The regional contact subsections of the data-protection-rights section ("For users located in the European Economic Area (EEA), UK and CH", India, other countries/territories) are the recurring case: each heading line stays a standalone bold paragraph and its address, authority and contact paragraphs stay ordinary paragraphs.
9. Preserve inline bold and italic ranges, hyperlinks, visible URLs, email addresses, and paragraph order. Close links syntactically rather than inserting a visible separator that is absent from Word.

Reserve level 2 so the rendered legal page keeps the same compact hierarchy as the approved sample set.

The flattened form in rule 8 was verified on device in the Mi Home plugin for the European multi-oscillation toothbrush Pro on 2026-11-26 across 28 languages, including right-to-left Arabic and Hebrew. Keeping the `-` marker and indenting the continuation paragraphs into the list item is not approved: it has never been checked in the app renderer. Visible wording never changes; only the list marker, which Word renders as a bullet glyph, is dropped.

Every conversion report records `structure.list_continuation_paragraphs` and `structure.flattened_list_items`. For this policy template each language yields 12 continuation paragraphs and exactly 3 flattened items. A different count means the source structure changed and needs review before delivery.

## Contents and anchors

For an international policy with decimal numbering:

```markdown
### <original overview label>

1. [<original section text>](#target1)

2. [<original section text>](#target2)

3. [<original section text>](#target3)

   3.1 [<original subsection text>](#target3_1)
```

For a policy whose source already includes a textual number such as `一、`, keep that prefix unchanged and place only the remaining source text inside the link:

```markdown
一、[<original text after the prefix>](#target1)
```

Body example:

```markdown
### 3. <original section text><a id="target3"></a>

#### 3. 1. <original subsection text><a id="target3_1"></a>
```

Do not force a 13-section international template onto a source with a different approved structure. Build the contents and anchors from matching source headings.

## RTL

Arabic and Hebrew text stays in source order. Wrap only an ASCII section-number prefix in `<span dir="ltr">` when needed for stable rendering. Do not reverse text, replace punctuation, change Arabic digits, or insert spaces around Latin product names and URLs.
