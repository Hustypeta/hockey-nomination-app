import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  FANTASY_RESULTS_EMAIL_SUBJECT,
  buildFantasyResultsThankYouHtml,
  buildFantasyResultsThankYouText,
} from "../src/lib/emails/fantasyResultsThankYouEmail";

const sample = { points: 214, rank: 1 };
const outDir = join(process.cwd(), "artifacts", "email");
mkdirSync(outDir, { recursive: true });

const htmlPath = join(outDir, "fantasy-results-thank-you-preview.html");
const textPath = join(outDir, "fantasy-results-thank-you-preview.txt");

writeFileSync(htmlPath, buildFantasyResultsThankYouHtml(sample), "utf8");
writeFileSync(
  textPath,
  [`Předmět: ${FANTASY_RESULTS_EMAIL_SUBJECT}`, "", buildFantasyResultsThankYouText(sample)].join("\n"),
  "utf8",
);

console.log(htmlPath);
console.log(textPath);
