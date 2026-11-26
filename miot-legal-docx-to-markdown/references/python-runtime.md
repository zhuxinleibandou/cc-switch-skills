# Python and Pandoc runtime

The converter needs Python 3.10+, `python-docx` 1.2+, and a real Pandoc executable. It uses the same conversion and fidelity checks in Claude Code and Codex.

## Select an environment

Use an existing project environment or an available bundled runtime if its interpreter and dependencies pass the checks below. Resolve the interpreter to an explicit path; do not assume that the shell's `python` is suitable.

If dependencies are missing, use a dedicated virtual environment in the working project. With a verified Python 3.10+ interpreter and the absolute skill directory:

```bash
"<python-3.10+-path>" -m venv "<project-dir>/.venv-miot-legal"
"<project-dir>/.venv-miot-legal/bin/python" -m pip install -r "<skill-dir>/scripts/requirements.txt"
```

On Windows, the virtual environment interpreter is `Scripts/python.exe` instead of `bin/python`. Dependency installation downloads packages; follow the host's existing network and execution permissions. Do not modify global Python packages.

`pypandoc_binary` includes Pandoc. The converter first checks `PATH`, then uses the executable from `pypandoc` when installed. If a binary wheel is unavailable for the platform, install only `python-docx` in the environment and use an existing system Pandoc; do not replace the Pandoc fidelity check with another renderer.

## Verify before conversion

Run with the selected interpreter:

```bash
"<verified-python>" -c "import sys, docx; from docx.text.paragraph import Paragraph; assert sys.version_info >= (3, 10); assert hasattr(Paragraph, 'iter_inner_content'); print(sys.executable, docx.__version__)"
"<verified-python>" "<skill-dir>/scripts/convert_legal_docx.py" --help
```

Check `pandoc --version` if Pandoc is on `PATH`; otherwise run:

```bash
"<verified-python>" -c "import pypandoc; print(pypandoc.get_pandoc_path()); print(pypandoc.get_pandoc_version())"
```

If no supported runtime or Pandoc can be prepared, report the missing dependency and stop. A missing renderer must never be reported as a fidelity `PASS`.
