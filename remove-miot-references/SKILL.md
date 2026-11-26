---
name: remove-miot-references
description: Remove Xiaomi MIOT SDK references from a project before open-source scanning, external sharing, or migration away from Mi Home. Use when asked to remove `miot` or `miot/*` imports, MIOT package dependencies, or MIOT-related references from JavaScript/TypeScript source.
---

# 移除miot引用

Remove MIOT dependencies with an explicit scope and an auditable before/after scan.

## Define the scope

1. Inspect repository-local `AGENTS.md` files and the working-tree status.
2. Search the selected project, excluding `node_modules`, for both direct imports and other literal MIOT references:

   ```sh
   rg -n "(?:from|require\()\s*['\"]miot(?:/[^'\"]*)?['\"]" <project> -g '!node_modules/**'
   rg -n -i "\bmiot\b" <project> -g '!node_modules/**'
   rg -n '"miot"' <project>/package.json <project>/package-lock.json
   ```

3. Classify matches as:
   - **Static SDK references**: `import ... from 'miot'`, `import ... from 'miot/ui/...'`, and `require('miot/...')`.
   - **Package metadata**: a `miot` dependency or lockfile entry.
   - **Non-SDK text/artifacts**: product copy, protocol names such as `MIOT-SPEC`, comments, generated output, or `node_modules`.
4. If the request does not make the scope explicit, ask whether to remove only unused imports, all static imports, or every literal MIOT occurrence. Do not silently delete non-SDK text or generated artifacts.

## Remove references

1. When asked to remove all static imports, state that surviving calls such as `Device.deviceID` and `NavigationBar` will become undefined and the project may not run. Proceed without replacements only after the user explicitly accepts that outcome.
2. Use `apply_patch` to remove every matching static import/require from project source. Do not edit `node_modules`.
3. Remove a `miot` entry from the selected project's dependency manifest and lockfile only when it is an actual project dependency. Do not alter a shared SDK/workspace dependency unless the user explicitly includes it.
4. Preserve non-SDK text such as `MIOT-SPEC` unless the user explicitly asks for literal-string removal.
5. Do not refactor or remove now-undefined SDK calls unless the user asks to delete the associated functionality.

## Verify and report

1. Re-run the direct import/require search. It must return no matches for a complete static-import removal.
2. Re-run the broader literal search and list any remaining non-SDK matches separately.
3. Check package manifests for a remaining direct `miot` dependency.
4. Parse or lint the touched source when available. Report parse success separately from runtime/build success; a build is expected to fail if imports were removed without replacements.
5. Report the number of removed import statements and files changed, any intentionally retained literal references, and the exact verification performed.
