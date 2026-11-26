# `gui-upload.mjs` usage

Wraps the running PicGo desktop app's local upload server (default `http://127.0.0.1:36677`). Zero dependencies; requires Node ≥ 22. Use it as the **first** upload route — if the app is running, it uploads with no install and no login, reusing the image hosting the user already configured in the GUI.

## When to use it

- The PicGo desktop app might be running and you want to upload without installing/logging into the CLI.
- The script probes `/heartbeat` first, so it's safe to just try it: if the app isn't up it exits `2` and you fall back to the `picgo` CLI.

## Invocation

```bash
# Upload one or more local files (absolute or relative paths)
node scripts/gui-upload.mjs /abs/path/a.png ./b.jpg

# Upload the current clipboard image (only when the user asked for the clipboard)
node scripts/gui-upload.mjs --clipboard

# Target a non-default port
node scripts/gui-upload.mjs --port 36678 ./a.png

# Provide the server auth secret (see below)
node scripts/gui-upload.mjs --secret <value> ./a.png

# Upload to one saved configuration for this request only (PicGo app >= 3.0.3)
node scripts/gui-upload.mjs --uploader github --configName Work ./a.png
node scripts/gui-upload.mjs --uploader github --configName "Work Images" ./a.png
```

## Choosing a configuration per upload

`--uploader`, `--configName` and `--configId` mirror `picgo upload` (the `--flag=value` form works too). The script sends them as query parameters on `POST /upload` (URL-encoded, so spaces and non-ASCII names are fine). They affect only this upload: the app's default uploader and saved settings don't change. Works for file paths and `--clipboard`.

- Requires PicGo desktop app **3.0.3 or later**. Older apps ignore the parameters and upload to their default host. When `--uploader` is given the script compares it with the `type` of the result and exits `6` on a mismatch; with only `--configName`/`--configId` there is nothing to compare against, so **always pass `--uploader` as well**.
- The GUI's configurations are the ones set in the app, not the CLI's `picgo uploader list`.
- An invalid selection is rejected with HTTP 400 **before anything is uploaded** (exit `5`). The message is meant to be shown to the user: an unknown uploader lists the available uploaders, and an ambiguous name lists the matching candidates.

## Output

On success, prints a single-line JSON array to stdout — the same shape as `picgo upload --format json`:

```json
[{"imgUrl":"https://...","fileName":"a.png","type":"github","size":12345}]
```

- `imgUrl` is the hosted URL (this is the field to use).
- `type` is the image hosting that handled it (e.g. `github`, `smms`, `picgo-cloud`) — use it to tell the user which host was used.
- Older PicGo apps may only return `imgUrl`; newer ones include `fileName`/`type`/`size`/`width`/`height`.

## Exit codes

| code | meaning | what to do |
|---|---|---|
| 0 | success | parse the JSON array from stdout |
| 1 | usage error (bad/missing args, file not found) | fix the arguments |
| 2 | GUI server not reachable | fall back to the `picgo` CLI |
| 3 | auth required/failed (server has a secret) | provide a secret, or fall back to the CLI |
| 4 | upload failed (server reached, upload errored) | read stderr; see `error-handling.md` |
| 5 | invalid upload target: unknown uploader, configuration not found, or ambiguous name (`INVALID_UPLOAD_OPTION` / `UNKNOWN_UPLOADER` / `UPLOAD_CONFIG_NOT_FOUND` / `UPLOAD_CONFIG_AMBIGUOUS`); nothing was uploaded | show the message, ask the user which configuration they meant; don't retry or fall back to the CLI with the same name |
| 6 | uploaded, but with a different uploader than `--uploader` asked for (app older than 3.0.3 ignored the selection); the JSON result is still on stdout | tell the user the file went to their default host (`type`) and that per-upload selection needs PicGo ≥ 3.0.3 |

Errors go to stderr; the JSON result only ever goes to stdout.

## Auth secret

Most users have no secret set, so no auth is needed. A secret is only required if the user enabled it in the PicGo server settings. Resolution order:

1. `--secret <value>` flag
2. a `.env` file **next to the script** (`scripts/.env`) containing `PICGO_SERVER_SECRET=...` (loaded via Node's built-in `process.loadEnvFile`)
3. the `PICGO_SERVER_SECRET` environment variable

Example `scripts/.env`:

```
PICGO_SERVER_SECRET=your-secret-here
```

> Do **not** commit `scripts/.env` to git — it holds a plaintext secret. Add it to `.gitignore`.

If you hit exit code `3` and don't have the secret, just fall back to the `picgo` CLI route (Step 2/3 in SKILL.md) — it doesn't need the GUI server.
