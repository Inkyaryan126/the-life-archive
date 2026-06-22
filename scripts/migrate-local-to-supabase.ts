import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

async function migrate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const dataPath = path.join(process.cwd(), "data", "life-archive.json");
  const rawData = await readFile(dataPath, "utf8");
  const { archives, memories } = JSON.parse(rawData);

  // Filter out seeds (sari-rae, dustin-sigley)
  const seedSlugs = new Set(["sari-rae", "dustin-sigley"]);
  const archivesToMigrate = archives.filter(
    (a: any) => !seedSlugs.has(a.slug)
  );

  console.log(`Migrating ${archivesToMigrate.length} archives...`);

  for (const archive of archivesToMigrate) {
    const { data: archiveRow, error: archiveError } = await supabase
      .from("archives")
      .insert({
        slug: archive.slug,
        archive_name: archive.archiveName,
        person_name: archive.personName,
        bio: archive.bio,
        profile_photo_url: archive.profilePhotoUrl,
        visibility: archive.visibility,
        memorial_mode: archive.memorialMode,
        created_at: archive.createdAt,
        is_demo: false, // Actual users
        owner_id: "00000000-0000-0000-0000-000000000000", // Placeholder owner
      })
      .select()
      .single();

    if (archiveError) {
      console.error(`Error migrating archive ${archive.slug}:`, archiveError);
      continue;
    }

    const archiveMemories = memories.filter(
      (m: any) => m.archiveSlug === archive.slug
    );

    console.log(
      `Migrating ${archiveMemories.length} memories for ${archive.slug}...`
    );

    for (const memory of archiveMemories) {
      const { error: memoryError } = await supabase.from("memories").insert({
        archive_id: archiveRow.id,
        title: memory.title,
        type: memory.type,
        content: memory.content,
        media_url: memory.mediaUrl,
        memory_date: memory.date,
        tags: memory.tags,
        created_at: memory.date,
      });

      if (memoryError) {
        console.error(`Error migrating memory ${memory.id}:`, memoryError);
      }
    }
  }

  console.log("Migration complete.");
}

migrate().catch(console.error);
