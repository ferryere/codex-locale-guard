# Codex Open Source Fund — application draft

## Applicant

- First name: Emerson
- Last name: Ferreira dos Santos
- Email: erminho_ferryere@hotmail.com
- Personal GitHub: https://github.com/ferryere

## Project name

Codex Locale Guard

## Brief project description

Codex Locale Guard is an open-source CLI for translating and auditing structured product content without breaking the details that make production publishing risky: JSON keys, URLs, HTML tags, template variables, prices, currency codes, and brand glossary terms. It writes a separate localized file and an audit report so teams can review every change before publishing.

The first release supports flat JSON dictionaries. The roadmap adds nested JSON, Markdown and HTML adapters; a GitHub Action that audits localization pull requests; language-quality checks; and explicit, human-approved suggestions for locale-specific price and date changes. Initial language coverage focuses on English, Brazilian Portuguese, Portuguese (Portugal), Latin American Spanish, French, German, Italian and Dutch.

## Team

Emerson Ferreira dos Santos — creator and maintainer.

## How OpenAI API credits would be used

The credits will be used to build and evaluate a safe localization workflow across real-world product-content patterns and language pairs. The API translates only structured text values while the tool verifies that sensitive tokens remain unchanged. Credits will support a test corpus, quality evaluations, glossary handling, and a review queue for lower-confidence outputs.

They will also enable development of a GitHub Action that produces a localization audit on pull requests, helping maintainers catch broken links, variables, HTML, and currency tokens before changes are published. The project will document prompts, guardrails, evaluation cases, and failure modes so other open-source teams can reuse the approach.

## Repository URL

To be added after publication: https://github.com/ferryere/codex-locale-guard
