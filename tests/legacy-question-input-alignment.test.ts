import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Verify File Path
const scrollScenePath = path.join(
  process.cwd(),
  "components/legacy-question/LegacyQuestionScrollScene.tsx"
);
assert.equal(fs.existsSync(scrollScenePath), true, "LegacyQuestionScrollScene.tsx must exist");

const content = fs.readFileSync(scrollScenePath, "utf8");

// 2. Verify Region 8 & 9 Standardized Height & Flex Centering
assert.ok(
  content.includes('id="legacy-email-address"'),
  "Email Address input must exist"
);
assert.ok(
  content.includes('id="legacy-first-name"'),
  "First Name input must exist"
);

// Check wrapper container styling
const emailWrapperRegex = /top-\[50\.622%\][^>]*h-\[2\.348%\][^>]*items-center/;
const firstNameWrapperRegex = /top-\[50\.622%\][^>]*h-\[2\.348%\][^>]*items-center/;

assert.ok(
  emailWrapperRegex.test(content),
  "Email input wrapper must use top-[50.622%], h-[2.348%], and flex items-center"
);
assert.ok(
  firstNameWrapperRegex.test(content),
  "First Name input wrapper must use top-[50.622%], h-[2.348%], and flex items-center"
);

// Check input field typography and line-height centering
assert.ok(
  content.includes("leading-none") && content.includes("py-0") && content.includes("my-auto"),
  "Input fields must specify leading-none, py-0, and my-auto for vertical centering"
);

// 3. Verify Spatial Separation from Reminder Checkbox (Region 10 at top-[53.2%])
assert.ok(
  content.includes("top-[53.2%]"),
  "Reminder checkbox must remain positioned at top-[53.2%]"
);

console.log("legacy-question-input-alignment tests passed cleanly!");
