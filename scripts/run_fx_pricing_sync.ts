#!/usr/bin/env tsx

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { syncCatalogToLatestFxRate } from "../src/lib/fxPricingSync";

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--apply");
  if (unknownArguments.length) {
    throw new Error(`Unsupported arguments: ${unknownArguments.join(", ")}`);
  }

  const summary = await syncCatalogToLatestFxRate({ apply });
  const output = resolve(
    process.cwd(),
    "reports",
    `fx_pricing_sync_${summary.rateDate.replaceAll("-", "")}_${apply ? "applied" : "dry_run"}.json`,
  );
  await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ summary, output }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "unknown_error");
  process.exitCode = 1;
});
