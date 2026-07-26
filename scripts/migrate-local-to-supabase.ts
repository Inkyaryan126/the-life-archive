import { createClient } from "@supabase/supabase-js";
import { parseMigrationOptions, runLocalMigration } from "../lib/local-migration";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Idempotent Local-to-Supabase Migration Script");
    console.log("\nUsage:");
    console.log("  npm run db:migrate-local -- --dry-run --owner-email <email>");
    console.log("  npm run db:migrate-local -- --verify --owner-id <uuid>");
    console.log("  npm run db:migrate-local -- --apply --owner-email <email> --production-confirm --confirm-plan <planHash>");
    console.log("\nOptions:");
    console.log("  --dry-run             Inspect local source & generate planHash without database writes");
    console.log("  --verify              Reconcile source against destination and ledger records");
    console.log("  --apply               Execute safe migration writes");
    console.log("  --owner-email <email> Target user email address");
    console.log("  --owner-id <uuid>     Target user UUID");
    console.log("  --source <path>       Path to local JSON file (default: data/life-archive.json)");
    console.log("  --production-confirm  Confirmation flag required for apply mode");
    console.log("  --confirm-plan <hash> Matching plan hash generated during dry-run");
    console.log("  --json                Output clean JSON summary block to stdout");
    process.exit(0);
  }

  let options;

  try {
    options = parseMigrationOptions(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Migration Argument Error: ${message}`);
    console.error("\nRun with --help for CLI options.");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Fatal Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const summary = await runLocalMigration(supabase, options);

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log("\n=======================================================");
      console.log(` THE LIFE ARCHIVE - LOCAL TO SUPABASE MIGRATION [${summary.mode.toUpperCase()}]`);
      console.log("=======================================================");
      console.log(`Source File        : ${summary.sourceFile}`);
      console.log(`Target Owner ID    : ${summary.ownerId}`);
      console.log(`Target Owner Email : ${summary.ownerEmailMasked}`);
      console.log(`Calculated PlanHash: ${summary.planHash}`);
      console.log("-------------------------------------------------------");
      console.log(`Archives  - Create: ${summary.archivesCreate} | Update: ${summary.archivesUpdate} | Unchanged: ${summary.archivesUnchanged} | Conflicts: ${summary.archiveConflicts}`);
      console.log(`Memories  - Create: ${summary.memoriesCreate} | Update: ${summary.memoriesUpdate} | Unchanged: ${summary.memoriesUnchanged} | Missing: ${summary.memoriesMissing}`);
      console.log(`Ledger    - Creates: ${summary.ledgerCreates} | Updates: ${summary.ledgerUpdates}`);
      console.log("-------------------------------------------------------");
      console.log(`Status             : ${summary.status}`);

      if (summary.errors.length > 0) {
        console.error("\nErrors encountered:");
        for (const err of summary.errors) {
          console.error(` - ${err}`);
        }
      }

      if (options.mode === "dry-run" && summary.status === "READY") {
        console.log("\nTo apply this migration safely, execute:");
        console.log(`  npm run db:migrate-local -- --apply ${options.ownerId ? `--owner-id ${options.ownerId}` : `--owner-email ${options.ownerEmail}`} --production-confirm --confirm-plan ${summary.planHash}\n`);
      }
    }

    if (summary.status === "ERROR" || summary.status === "PLAN_MISMATCH" || summary.status === "VERIFY_FAILED" || summary.errors.length > 0) {
      process.exit(1);
    }
  } catch (fatalError) {
    const message = fatalError instanceof Error ? fatalError.message : String(fatalError);
    console.error(`Fatal Migration Failure: ${message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
