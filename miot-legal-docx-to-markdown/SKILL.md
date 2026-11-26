---
name: miot-legal-docx-to-markdown
description: Convert Xiaomi Home or Mi Home privacy policies and software license or user agreements from DOCX to the project's structured Markdown format while preserving every source-language word, character, punctuation mark, and URL. Use for one file or multilingual batches; do not use for rewriting, translation, or legal editing.
---

# Mi Home Legal DOCX to Markdown

Convert the Word document's structure, never its wording. The DOCX is the sole authority for visible text. Existing Markdown may guide hierarchy and syntax, but must not supply corrected, normalized, translated, or reformatted wording.

## Required references

Read [references/fidelity-rules.md](references/fidelity-rules.md) for every conversion.

- For a privacy policy, also read [references/privacy-policy-format.md](references/privacy-policy-format.md).
- For a software license, service agreement, or user agreement, also read [references/user-agreement-format.md](references/user-agreement-format.md).
- For a mixed batch, read both format references.

## Workflow

1. Inventory the DOCX files and pair them by language and document type. Treat privacy policy and user agreement as separate outputs.
2. Inspect repository-local `CLAUDE.md` and `AGENTS.md` instructions before writing. If work is under a Mi Home project, load its required knowledge base before conversion.
3. Read [references/python-runtime.md](references/python-runtime.md) and select a verified Python 3.10+ environment with `python-docx` and Pandoc. In Claude Code, use its Bash tool to check or prepare the environment; no Codex-specific tool is required. If a workspace dependency loader is available, its bundled runtime may also be used. Invoke the verified interpreter by its explicit path.
4. Resolve this skill's directory from the loaded `SKILL.md` location and run its `scripts/convert_legal_docx.py` by absolute path, regardless of the current working directory. Write to a new output directory by default; never replace source DOCX files or existing Markdown unless the user explicitly requests overwrite.
5. Require a generated conversion report with `text_fidelity_status: PASS`, `hyperlink_fidelity_status: PASS`, and overall `fidelity_status: PASS` for every file. Require empty `hyperlinks.missing`, `hyperlinks.mismatched`, and `hyperlinks.unparsed_fields`. Review-comment counts are allowed because comments are excluded annotations. A warning is not a pass when it concerns missing body text, tracked changes, text boxes, tables, headers, footers, or another unsupported content container.
6. Check each report's `structure` block and `warnings` before accepting the batch. The continuation-paragraph count and flattened list items must be identical across languages of the same template, `structure.warnings` must be empty, and every hyperlink-adjacency warning must be entered in a source-defect list for the document owner instead of being edited silently.
7. Inspect representative outputs: both document types, the first and last files, and every RTL language. Confirm title hierarchy, table of contents, anchors, list nesting, bold emphasis, links, and readable bidirectional numbering. Hyperlinks must retain their source display text and full destination, including mail addresses, query strings, trailing slashes, and external bookmark fragments. A text-only PASS or a URL-string count is insufficient.
8. Report the output directory, file count, fidelity result, and any format limitation. Never claim legal correctness or translation correctness; this skill verifies text preservation and Markdown structure only.

## Commands

Single file:

```bash
"<verified-python>" "<skill-dir>/scripts/convert_legal_docx.py" input.docx --output output.md --report conversion-report.json
```

Multilingual directory:

```bash
"<verified-python>" "<skill-dir>/scripts/convert_legal_docx.py" source-directory --output-root strict-markdown --report strict-markdown/conversion-report.json
```

Add `--overwrite` only when replacement is explicitly authorized. Use `--document-type privacy` or `--document-type agreement` only when automatic filename classification cannot decide safely.

## Invocation

In Claude Code, invoke `/miot-legal-docx-to-markdown` followed by the DOCX file or source directory and the desired output location. The skill is also discoverable for relevant natural-language requests. In Codex, the existing `$miot-legal-docx-to-markdown` invocation remains usable.

## Stop conditions

Do not guess or silently discard content. Stop and request review when the script reports an unsupported or ambiguous feature, cannot classify the legal document, cannot match table-of-contents entries to body headings, or cannot prove every source paragraph and hyperlink appears unchanged in the rendered Markdown. Internal bookmark links, nested fields, non-HYPERLINK fields, unbalanced fields, and unsupported switches require review; do not convert them to plain text and report success. Keep the generated failure diagnostics for review.
