import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const task = process.argv.slice(2).join(" ");

if (!task) {
  console.error('Usage: node scripts/agent/run-task.mjs "your task"');
  process.exit(1);
}

const policy = readFileSync(
  new URL("./task-policy.txt", import.meta.url),
  "utf8"
);

const fullPrompt = `${policy}

${task}`;

console.log("\n=== TLA AGENT BRIDGE ===");
console.log("Task:", task);
console.log("========================\n");

const child = spawn(
  "agy",
  [
  "--dangerously-skip-permissions",
  "--print-timeout",
  "30m",
  "-p",
  fullPrompt,
],
  {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  }
);

child.stdout.on("data", (data) => {
  process.stdout.write(data);
});

child.stderr.on("data", (data) => {
  process.stderr.write(data);
});

child.on("error", (error) => {
  console.error("\nFailed to start Antigravity:", error.message);
  process.exit(1);
});

child.on("close", (code) => {
  console.log(`\n\n=== Antigravity exited with code ${code} ===`);
  process.exit(code ?? 1);
});
