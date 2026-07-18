import assert from "node:assert/strict";
import { getArchiveBuildingMenuItems } from "../components/archive-building/navigation";

const items = getArchiveBuildingMenuItems("dustin-archive");
const labels = items.map((item) => item.kind === "divider" ? "---" : item.label);

assert.deepEqual(labels, [
  "My Archives",
  "Add Voice & Sound",
  "Add Photos & Video",
  "Write a Letter or Journal Entry",
  "Time Capsules",
  "---",
  "Keepsake Store",
  "Member Card",
  "QR Code",
  "---",
  "Settings"
]);

assert.equal(items.filter((item) => item.kind === "divider").length, 2);
assert.equal(labels.filter((label) => label === "Time Capsules").length, 1);
assert.equal(labels.includes("Legacy Question"), false);

const addVoiceItem = items.find(
  (item) => item.kind === "link" && item.label === "Add Voice & Sound"
);
const qrItem = items.find((item) => item.kind === "link" && item.label === "QR Code");
const timeCapsulesItem = items.find(
  (item) => item.kind === "link" && item.label === "Time Capsules"
);

assert.equal(addVoiceItem?.kind === "link" ? addVoiceItem.href : "", "/archive/dustin-archive/add-memory?mode=voice-sound");
assert.equal(timeCapsulesItem?.kind === "link" ? timeCapsulesItem.href : "", "/dashboard/time-capsules");
assert.equal(timeCapsulesItem?.kind === "link" ? timeCapsulesItem.indent : false, true);
assert.equal(qrItem?.kind === "link" ? qrItem.href : "", "/archive/dustin-archive/qr");

const fallbackItems = getArchiveBuildingMenuItems(null);
const fallbackAddVoice = fallbackItems.find(
  (item) => item.kind === "link" && item.label === "Add Voice & Sound"
);

assert.equal(fallbackAddVoice?.kind === "link" ? fallbackAddVoice.href : "", "/create");

console.log("archive-building-navigation tests passed");
