# User agreement Markdown format

Use this structure for software license agreements, service agreements, and user agreements. The exact wording and section count always come from the DOCX.

## Structure

1. The first non-empty Word paragraph becomes `# <original title>`.
2. Keep the important-notice label as its own paragraph and preserve its source emphasis.
3. Preserve the notice body as ordinary paragraphs with the original bold ranges.
4. Main numbered clauses represented as Word headings become level-3 headings.
5. Numbered subclauses such as `1.1`, `4.2`, and `4.2.3.1` remain ordinary paragraphs unless the DOCX explicitly styles them as headings.
6. Preserve paragraph order, blank separation between clauses, inline emphasis, URLs, email addresses, and any list indentation. Close links syntactically rather than inserting a visible separator that is absent from Word.
7. Do not generate a table of contents or anchors unless the DOCX already contains a contents block.

Example:

```markdown
# <original agreement title>

**<original important-notice label>**

<original notice paragraph with original emphasis>

### 1. <original section heading>

1.1 <original clause text>
```

Do not add missing punctuation after clause numbers. If the source says `1.1.` keep `1.1.`; if it says `1.1` keep `1.1`. Do not replace square brackets with full-width brackets or the reverse.
