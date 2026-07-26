import { validateEnvironment, type EnvProfile, type TargetEnvironment } from "../lib/env-validation";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Startup Environment Validation and Preflight Check CLI");
    console.log("\nUsage:");
    console.log("  npm run env:check");
    console.log("  npm run env:check -- --profile core");
    console.log("  npm run env:check -- --profile payments");
    console.log("  npm run env:check -- --environment production");
    console.log("  npm run env:check -- --json");
    console.log("\nProfiles:");
    console.log("  core, payments, email, cron, public-submission-security, keepsake-security, all");
    console.log("\nEnvironments:");
    console.log("  production, preview, development, test");
    process.exit(0);
  }

  let profile: EnvProfile = "all";
  let environment: TargetEnvironment | undefined;
  let json = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--profile") {
      i += 1;
      const val = args[i] as EnvProfile;
      const validProfiles = ["core", "payments", "email", "cron", "public-submission-security", "keepsake-security", "all"];
      if (!val || !validProfiles.includes(val)) {
        console.error(`Invalid --profile specified: ${val}`);
        process.exit(2);
      }
      profile = val;
    } else if (arg === "--environment") {
      i += 1;
      const val = args[i] as TargetEnvironment;
      const validEnvs = ["production", "preview", "development", "test"];
      if (!val || !validEnvs.includes(val)) {
        console.error(`Invalid --environment specified: ${val}`);
        process.exit(2);
      }
      environment = val;
    } else if (arg === "--json") {
      json = true;
    } else {
      console.error(`Unknown CLI flag: ${arg}`);
      process.exit(2);
    }
  }

  const targetEnv = environment || (process.env.VERCEL_ENV as TargetEnvironment) || (process.env.NODE_ENV as TargetEnvironment) || "development";
  const result = validateEnvironment(process.env, { profile, environment: targetEnv });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("\n=======================================================");
    console.log(` THE LIFE ARCHIVE - ENVIRONMENT PREFLIGHT CHECK`);
    console.log("=======================================================");
    console.log(`Target Profile     : ${result.profile}`);
    console.log(`Target Environment : ${result.environment}`);
    console.log("-------------------------------------------------------");

    if (result.ok) {
      console.log("Status             : PASSED (All required variables are valid)\n");
    } else {
      console.log("Status             : FAILED\n");
      console.log("Errors:");
      for (const err of result.errors) {
        console.log(` - [${err.variable}] (${err.code}): ${err.message}`);
      }
      console.log("");
    }
  }

  if (!result.ok) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
