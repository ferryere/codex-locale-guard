import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import OpenAI from "openai";

type Dictionary = Record<string, string>;

type Options = {
  input: string;
  output: string;
  source: string;
  target: string;
  glossary: Record<string, string>;
};

function usage(): never {
  console.error("Usage: codex-locale-guard --input source.json --output target.json --source en --target pt-BR [--glossary term=translation]");
  process.exit(1);
}

function parseArgs(args: string[]): Options {
  const values: Record<string, string> = {};
  const glossary: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    if (!flag?.startsWith("--") || !value) usage();
    if (flag === "--glossary") {
      for (const pair of value.split(",")) {
        const [term, replacement] = pair.split("=");
        if (!term || !replacement) usage();
        glossary[term.trim()] = replacement.trim();
      }
    } else {
      values[flag.slice(2)] = value;
    }
  }
  if (!values.input || !values.output || !values.source || !values.target) usage();
  return { input: values.input, output: values.output, source: values.source, target: values.target, glossary };
}

function assertFlatDictionary(value: unknown): asserts value is Dictionary {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Input must be a JSON object.");
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item !== "string") throw new Error(`Value for '${key}' must be a string. Nested JSON support is on the roadmap.`);
  }
}

function protectedTokens(text: string): string[] {
  return text.match(/https?:\/\/\S+|\{\{[^}]+\}\}|<[^>]+>|(?:USD|EUR|BRL|GBP|CAD|AUD)\s?\$?\d+(?:[.,]\d{2})?/g) ?? [];
}

function buildPrompt(input: Dictionary, options: Options): string {
  return `You are a careful localization engine. Translate the VALUES of this flat JSON object from ${options.source} to ${options.target}.\n\nRules:\n- Return valid JSON only, with exactly the same keys.\n- Preserve URLs, HTML tags, {{variables}}, prices, currency codes, line breaks, and punctuation where appropriate.\n- Do not invent claims, testimonials, results, or legal assurances.\n- Use the glossary exactly: ${JSON.stringify(options.glossary)}\n- Adapt phrasing naturally for ${options.target}.\n\nInput:\n${JSON.stringify(input, null, 2)}`;
}

function audit(source: Dictionary, translated: Dictionary, target: string) {
  const missingKeys = Object.keys(source).filter((key) => !(key in translated));
  const extraKeys = Object.keys(translated).filter((key) => !(key in source));
  const changedProtectedTokens = Object.entries(source).flatMap(([key, value]) => {
    const before = protectedTokens(value);
    const after = protectedTokens(translated[key] ?? "");
    return before.every((token) => after.includes(token)) ? [] : [{ key, before, after }];
  });
  const likelySourceLeftovers = Object.entries(translated)
    .filter(([, value]) => /\b(the|and|your|with|for|download|access|checkout)\b/i.test(value) && !target.toLowerCase().startsWith("en"))
    .map(([key, value]) => ({ key, value }));
  return { generatedAt: new Date().toISOString(), target, missingKeys, extraKeys, changedProtectedTokens, likelySourceLeftovers };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = JSON.parse(await readFile(options.input, "utf8"));
  assertFlatDictionary(source);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required.");

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5.2",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: buildPrompt(source, options) }]
  });
  const translated = JSON.parse(completion.choices[0]?.message.content || "{}");
  assertFlatDictionary(translated);
  const report = audit(source, translated, options.target);
  if (report.missingKeys.length || report.extraKeys.length || report.changedProtectedTokens.length) {
    throw new Error(`Unsafe translation rejected. See audit: ${JSON.stringify(report)}`);
  }
  await writeFile(options.output, `${JSON.stringify(translated, null, 2)}\n`);
  const auditPath = join(dirname(options.output), `${basename(options.output, extname(options.output))}.audit.json`);
  await writeFile(auditPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Translated ${Object.keys(source).length} values to ${options.target}. Audit: ${auditPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
