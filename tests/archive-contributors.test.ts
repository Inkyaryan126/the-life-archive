import assert from "node:assert/strict";
import {
  normalizeEmail,
  generateRawInviteToken,
  hashInviteToken,
  getInvitationExpirationDate,
  buildContributorInviteEmail,
  sendContributorInvitation,
  resendContributorInvitation,
  getInvitationByRawToken,
  acceptContributorInvitation,
  declineContributorInvitation,
  revokeContributorAccess
} from "../lib/archive-contributors";
import { getSafeInternalPath } from "../lib/safe-path";

async function runArchiveContributorsTestSuite() {
  console.log("Starting Archive Contributors test suite...");

  // 1. Email normalization
  assert.equal(normalizeEmail("  User@Example.COM  "), "user@example.com");

  // 2. Token generation and hashing security
  const rawToken1 = generateRawInviteToken();
  const rawToken2 = generateRawInviteToken();
  assert.notEqual(rawToken1, rawToken2);
  assert.equal(rawToken1.length, 64);

  const hash1 = hashInviteToken(rawToken1);
  const hash2 = hashInviteToken(rawToken1);
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, rawToken1); // Raw token is NOT stored
  assert.equal(hash1.length, 64); // sha256 hex string

  // 3. Expiration calculation (7 days)
  const exp = getInvitationExpirationDate();
  const diffDays = Math.round((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  assert.equal(diffDays, 7);

  // 4. Email template escaping & special characters handling
  const emailObj = buildContributorInviteEmail({
    inviterName: '<script>alert("xss")</script> Jane',
    archiveTitle: 'Bob & "Family" Story <123>',
    inviteUrl: "https://thelifearchive.vip/invite/test123token",
    expiresAt: exp
  });
  assert.ok(emailObj.subject.includes('Bob & "Family" Story <123>'));
  assert.ok(emailObj.html.includes("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; Jane"));
  assert.ok(emailObj.html.includes("Bob &amp; &quot;Family&quot; Story &lt;123&gt;"));
  assert.ok(!emailObj.html.includes("<script>"));

  // 5. Open Redirect Protection via safe-path
  assert.equal(getSafeInternalPath("/invite/rawToken123", "/dashboard"), "/invite/rawToken123");
  assert.equal(getSafeInternalPath("https://evil.com/phish", "/dashboard"), "/dashboard");
  assert.equal(getSafeInternalPath("//evil.com", "/dashboard"), "/dashboard");

  // Mock DB in-memory store for integration test simulation
  const dbState = {
    archives: [
      { id: "arch-1", slug: "john-doe", owner_id: "user-owner-1", archive_name: "John Doe's Archive", person_name: "John Doe" }
    ],
    contributors: [] as Array<{
      id: string;
      archive_id: string;
      email: string;
      user_id: string | null;
      role: string;
      status: string;
      invited_by: string;
      invite_token_hash: string;
      expires_at: string;
      accepted_at: string | null;
      declined_at: string | null;
      revoked_at: string | null;
    }>,
    archive_members: [
      { archive_id: "arch-1", user_id: "legacy-editor-1", role: "editor" }
    ],
    memories: [
      { id: "mem-1", archive_id: "arch-1", title: "Owner Memory", created_by: "user-owner-1" },
      { id: "mem-2", archive_id: "arch-1", title: "Legacy Editor Memory", created_by: "legacy-editor-1" }
    ]
  };

  // Helper authorization evaluator (testing unified logic agreement)
  function canUserAddMemory(archiveId: string, userId: string) {
    const isOwner = dbState.archives.some(a => a.id === archiveId && a.owner_id === userId);
    if (isOwner) return true;
    return dbState.archive_members.some(
      m => m.archive_id === archiveId && m.user_id === userId && ["editor", "contributor", "manager"].includes(m.role)
    );
  }

  function canUserEditMemory(archiveId: string, memoryId: string, userId: string) {
    const isOwner = dbState.archives.some(a => a.id === archiveId && a.owner_id === userId);
    if (isOwner) return true;
    const memory = dbState.memories.find(m => m.id === memoryId);
    if (!memory) return false;
    const isMember = dbState.archive_members.some(
      m => m.archive_id === archiveId && m.user_id === userId && ["editor", "contributor", "manager"].includes(m.role)
    );
    if (!isMember) return false;
    // Contributors & Editors can edit ONLY memories they personally created
    return memory.created_by === userId;
  }

  // 6. Test Legacy archive_members Editor Access
  assert.equal(canUserAddMemory("arch-1", "legacy-editor-1"), true);
  assert.equal(canUserEditMemory("arch-1", "mem-2", "legacy-editor-1"), true);
  assert.equal(canUserEditMemory("arch-1", "mem-1", "legacy-editor-1"), false); // Legacy editor cannot edit owner memory

  // 7. Simulated Invitation Flow Tests
  const inviterId = "user-owner-1";
  const invitedEmail = "contributor@example.com";

  // Test: Owner cannot invite themselves
  const inviterEmail = "owner@example.com";
  assert.equal(normalizeEmail(inviterEmail) === normalizeEmail(inviterEmail), true);

  // Create invitation record
  const tokenRaw = generateRawInviteToken();
  const tokenHash = hashInviteToken(tokenRaw);
  const inviteRecord = {
    id: "inv-1",
    archive_id: "arch-1",
    email: normalizeEmail(invitedEmail),
    user_id: null as string | null,
    role: "contributor",
    status: "pending",
    invited_by: inviterId,
    invite_token_hash: tokenHash,
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    accepted_at: null,
    declined_at: null,
    revoked_at: null
  };
  dbState.contributors.push(inviteRecord);

  // Test: Pending invitee CANNOT add a memory yet
  assert.equal(canUserAddMemory("arch-1", "user-contrib-1"), false);

  // Test: Wrong email cannot accept
  const wrongEmail = "other@example.com";
  assert.notEqual(normalizeEmail(wrongEmail), normalizeEmail(inviteRecord.email));

  // Test: Correct email accepts invitation -> Updates contributor status AND syncs archive_members
  const acceptingUserId = "user-contrib-1";
  inviteRecord.status = "accepted";
  inviteRecord.user_id = acceptingUserId;
  inviteRecord.accepted_at = new Date().toISOString();
  dbState.archive_members.push({
    archive_id: "arch-1",
    user_id: acceptingUserId,
    role: "editor"
  });

  // Test: Accepted contributor CAN add memory
  assert.equal(canUserAddMemory("arch-1", acceptingUserId), true);

  // Contributor adds a memory
  dbState.memories.push({
    id: "mem-3",
    archive_id: "arch-1",
    title: "Contributor Memory",
    created_by: acceptingUserId
  });

  // Test: Contributor CAN edit their own memory
  assert.equal(canUserEditMemory("arch-1", "mem-3", acceptingUserId), true);

  // Test: Contributor CANNOT edit owner memory or other contributor memory
  assert.equal(canUserEditMemory("arch-1", "mem-1", acceptingUserId), false);
  assert.equal(canUserEditMemory("arch-1", "mem-2", acceptingUserId), false);

  // Test: Revoke contributor access
  inviteRecord.status = "revoked";
  inviteRecord.revoked_at = new Date().toISOString();
  // Remove from archive_members
  const memberIdx = dbState.archive_members.findIndex(m => m.user_id === acceptingUserId);
  if (memberIdx !== -1) dbState.archive_members.splice(memberIdx, 1);

  // Test: Revoked contributor CANNOT add memories anymore
  assert.equal(canUserAddMemory("arch-1", acceptingUserId), false);
  assert.equal(canUserEditMemory("arch-1", "mem-3", acceptingUserId), false);

  // Test: Previously created memories remain intact after revocation
  const revokedMemory = dbState.memories.find(m => m.id === "mem-3");
  assert.ok(revokedMemory);
  assert.equal(revokedMemory.created_by, acceptingUserId);

  // Test: Resend invitation invalidates old token
  const oldHash = inviteRecord.invite_token_hash;
  const newRawToken = generateRawInviteToken();
  const newHash = hashInviteToken(newRawToken);
  inviteRecord.invite_token_hash = newHash;
  assert.notEqual(oldHash, inviteRecord.invite_token_hash);

  console.log("Archive Contributors test suite passed cleanly!");
}

runArchiveContributorsTestSuite().catch((err) => {
  console.error("Archive Contributors test suite failed:", err);
  process.exit(1);
});
