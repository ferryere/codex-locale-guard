# Codex Locale Guard

An open-source CLI that audits and translates structured product content without breaking keys, prices, URLs, variables, or brand terms.

It is designed for the failure mode common in small teams: a page looks translated, but some source-language strings, currencies, variables, or legal text are silently left behind. The tool produces a machine-readable audit before it writes anything and sends only the translatable values to an OpenAI model.

## What it does

- Translates flat JSON dictionaries while preserving every key and JSON type.
- Preserves URLs, `{{variables}}`, HTML tags, prices, and a configurable glossary.
- Detects likely source-language leftovers after translation.
- Writes a separate output file by default; source content is never overwritten.
- Creates a concise audit report suitable for pull-request review.

## Install

```bash
npm install
npm run build
```

Set `OPENAI_API_KEY` in your environment. Optionally set `OPENAI_MODEL`; it defaults to `gpt-5.2`.

## Usage

```bash
node dist/cli.js \
  --input example/source.en.json \
  --output example/pt-BR.json \
  --source en \
  --target pt-BR \
  --glossary "Botanical Watercolor Workbook=Workbook de Aquarela Botânica"
```

The output file contains the translated JSON. A sidecar `*.audit.json` summarizes source keys, preserved tokens, and values that may still contain the source language.

## Why this project

Global creators and small businesses often localize landing pages, checkout pages, email flows, and member-area content manually. A single missed string can make a translated purchase flow look unreliable. Codex Locale Guard makes that workflow repeatable, reviewable, and safe to run in CI.

## Roadmap

- Nested JSON and Markdown/HTML adapters.
- Locale-aware price and date transformations with explicit approval gates.
- GitHub Action that comments a localization audit on pull requests.
- Human-review queue for low-confidence translations.

## Privacy and safety

Do not place API keys in a repository. The CLI sends only string values selected from the supplied JSON file to the OpenAI API. It intentionally does not crawl URLs or modify source files.

## License

MIT. See [LICENSE](LICENSE).
