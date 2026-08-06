import assert from "node:assert/strict";
import { getArchiveBuildingMenuItems } from "../components/archive-building/navigation";

const items = getArchiveBuildingMenuItems("dustin-archive");
const labels = items.map((item) => (item.kind === "divider" ? "---" : item.label));

assert.deepEqual(labels, [
  "ARCHIVE",
  "My Archives",
  "Final Wishes",
  "Grand Hall",
  "---",
  "PRESERVE",
  "Add a Memory",
  "Time Capsules",
  "Keepsake Store",
  "Member Card",
  "---",
  "GUIDANCE",
  "Archive Concierge",
  "After a Loss",
  "Help for Families",
  "Build Your Legacy",
  "Preserve Their Voice",
  "Eternism",
  "How It Works",
  "FAQ",
  "---",
  "ACCOUNT",
  "Settings"
]);

assert.equal(items.filter((item) => item.kind === "divider").length, 3);
assert.equal(labels.filter((label) => label === "Time Capsules").length, 1);
assert.equal(labels.filter((label) => label === "Keepsake Store").length, 1);
assert.equal(labels.filter((label) => label === "Archive Concierge").length, 1);

const addMemoryItem = items.find(
  (item) => item.kind === "link" && item.label === "Add a Memory"
);
const keepsakeItem = items.find(
  (item) => item.kind === "link" && item.label === "Keepsake Store"
);
const conciergeItem = items.find(
  (item) => item.kind === "link" && item.label === "Archive Concierge"
);

assert.equal(
  addMemoryItem?.kind === "link" ? addMemoryItem.href : "",
  "/archive/dustin-archive/add-memory"
);
assert.equal(
  keepsakeItem?.kind === "link" ? keepsakeItem.href : "",
  "/keepsakes"
);
assert.equal(
  conciergeItem?.kind === "link" ? conciergeItem.href : "",
  "/archive-concierge"
);

const fallbackItems = getArchiveBuildingMenuItems(null);
const fallbackAddMemory = fallbackItems.find(
  (item) => item.kind === "link" && item.label === "Add a Memory"
);

assert.equal(
  fallbackAddMemory?.kind === "link" ? fallbackAddMemory.href : "",
  "/create"
);

console.log("archive-building-navigation tests passed");
