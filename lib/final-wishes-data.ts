import { createClient } from "./supabase/server";
import { getArchiveBySlug } from "./archive-data";
import type { FinalWishes, FinalWishSong } from "./types";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const storePath = path.join(process.cwd(), "data", "life-archive.json");
const useSupabase = process.env.USE_SUPABASE === "true";

export async function getFinalWishesByArchiveSlug(
  slug: string
): Promise<FinalWishes | null> {
  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    return null;
  }

  if (useSupabase) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: archiveRow } = await supabase
      .from("archives")
      .select("id, owner_id")
      .eq("slug", slug)
      .maybeSingle();

    if (!archiveRow || archiveRow.owner_id !== user.id) {
      return null;
    }

    const { data: wishRow, error: wishError } = await supabase
      .from("final_wishes")
      .select("*")
      .eq("archive_id", archiveRow.id)
      .maybeSingle();

    if (wishError || !wishRow) {
      return null;
    }

    const { data: songRows } = await supabase
      .from("final_wish_songs")
      .select("*")
      .eq("final_wishes_id", wishRow.id)
      .order("sort_order", { ascending: true });

    const songs: FinalWishSong[] = (songRows || []).map((row) => ({
      id: row.id,
      finalWishesId: row.final_wishes_id,
      archiveId: row.archive_id,
      title: row.title,
      artist: row.artist,
      url: row.url,
      notes: row.notes,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return {
      id: wishRow.id,
      archiveId: wishRow.archive_id,
      archiveSlug: slug,
      userId: wishRow.user_id,
      servicePreference: wishRow.service_preference,
      serviceCustomDescription: wishRow.service_custom_description,
      serviceLocation: wishRow.service_location,
      traditions: wishRow.traditions,
      serviceTone: wishRow.service_tone,
      serviceInstructions: wishRow.service_instructions,
      dispositionPreference: wishRow.disposition_preference,
      dispositionLocation: wishRow.disposition_location,
      ashesInstructions: wishRow.ashes_instructions,
      donationNotes: wishRow.donation_notes,
      dispositionInstructions: wishRow.disposition_instructions,
      firstContact: wishRow.first_contact,
      preferredOfficiant: wishRow.preferred_officiant,
      pallbearerSuggestions: wishRow.pallbearer_suggestions,
      peopleToInvolve: wishRow.people_to_involve,
      peopleNotResponsible: wishRow.people_not_responsible,
      responsibilityNotes: wishRow.responsibility_notes,
      obituaryName: wishRow.obituary_name,
      obituaryRelationships: wishRow.obituary_relationships,
      obituaryAccomplishments: wishRow.obituary_accomplishments,
      obituaryCauses: wishRow.obituary_causes,
      obituaryNotes: wishRow.obituary_notes,
      obituaryExclusions: wishRow.obituary_exclusions,
      clothingPreference: wishRow.clothing_preference,
      displayPreferences: wishRow.display_preferences,
      gatheringPreferences: wishRow.gathering_preferences,
      finalMessage: wishRow.final_message,
      additionalWishes: wishRow.additional_wishes,
      songs,
      createdAt: wishRow.created_at,
      updatedAt: wishRow.updated_at
    };
  }

  // Local JSON fallback
  try {
    if (!existsSync(storePath)) return null;
    const json = readFileSync(storePath, "utf8");
    const data = JSON.parse(json);
    const wishes: FinalWishes[] = data.finalWishes || [];
    const found = wishes.find((item) => item.archiveSlug === slug || item.archiveId === archive.id);
    return found ? { ...found, archiveSlug: slug } : null;
  } catch {
    return null;
  }
}

export async function saveFinalWishes(
  slug: string,
  wishesInput: Omit<Partial<FinalWishes>, "id" | "archiveId" | "userId" | "songs">,
  songsInput: Array<Partial<FinalWishSong>>
): Promise<FinalWishes> {
  const archive = await getArchiveBySlug(slug);
  if (!archive) {
    throw new Error("Archive not found");
  }

  // Validate song titles
  for (let i = 0; i < songsInput.length; i++) {
    const s = songsInput[i];
    if (!s.title || !s.title.trim()) {
      throw new Error(`Song #${i + 1} requires a valid title.`);
    }
  }

  if (useSupabase) {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication required to save Final Wishes");
    }

    const { data: archiveRow } = await supabase
      .from("archives")
      .select("id, owner_id")
      .eq("slug", slug)
      .maybeSingle();

    if (!archiveRow || archiveRow.owner_id !== user.id) {
      throw new Error("You do not have permission to modify Final Wishes for this archive");
    }

    const { data: existingWish } = await supabase
      .from("final_wishes")
      .select("id")
      .eq("archive_id", archiveRow.id)
      .maybeSingle();

    const payload = {
      archive_id: archiveRow.id,
      user_id: user.id,
      service_preference: wishesInput.servicePreference || null,
      service_custom_description: wishesInput.serviceCustomDescription || null,
      service_location: wishesInput.serviceLocation || null,
      traditions: wishesInput.traditions || null,
      service_tone: wishesInput.serviceTone || null,
      service_instructions: wishesInput.serviceInstructions || null,
      disposition_preference: wishesInput.dispositionPreference || null,
      disposition_location: wishesInput.dispositionLocation || null,
      ashes_instructions: wishesInput.ashesInstructions || null,
      donation_notes: wishesInput.donationNotes || null,
      disposition_instructions: wishesInput.dispositionInstructions || null,
      first_contact: wishesInput.firstContact || null,
      preferred_officiant: wishesInput.preferredOfficiant || null,
      pallbearer_suggestions: wishesInput.pallbearerSuggestions || null,
      people_to_involve: wishesInput.peopleToInvolve || null,
      people_not_responsible: wishesInput.peopleNotResponsible || null,
      responsibility_notes: wishesInput.responsibilityNotes || null,
      obituary_name: wishesInput.obituaryName || null,
      obituary_relationships: wishesInput.obituaryRelationships || null,
      obituary_accomplishments: wishesInput.obituaryAccomplishments || null,
      obituary_causes: wishesInput.obituaryCauses || null,
      obituary_notes: wishesInput.obituaryNotes || null,
      obituary_exclusions: wishesInput.obituaryExclusions || null,
      clothing_preference: wishesInput.clothingPreference || null,
      display_preferences: wishesInput.displayPreferences || null,
      gathering_preferences: wishesInput.gatheringPreferences || null,
      final_message: wishesInput.finalMessage || null,
      additional_wishes: wishesInput.additionalWishes || null,
      updated_at: new Date().toISOString()
    };

    let wishesId = existingWish?.id;

    if (existingWish) {
      const { error: updateErr } = await supabase
        .from("final_wishes")
        .update(payload)
        .eq("id", existingWish.id);
      if (updateErr) throw updateErr;
    } else {
      const { data: newWish, error: insertErr } = await supabase
        .from("final_wishes")
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      wishesId = newWish.id;
    }

    if (!wishesId) {
      throw new Error("Unable to save Final Wishes record");
    }

    // Delete existing songs and insert updated song list in sort_order
    await supabase.from("final_wish_songs").delete().eq("final_wishes_id", wishesId);

    if (songsInput.length > 0) {
      const songPayloads = songsInput.map((song, index) => ({
        final_wishes_id: wishesId,
        archive_id: archiveRow.id,
        title: song.title!.trim(),
        artist: song.artist?.trim() || null,
        url: song.url?.trim() || null,
        notes: song.notes?.trim() || null,
        sort_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: songsErr } = await supabase
        .from("final_wish_songs")
        .insert(songPayloads);
      if (songsErr) throw songsErr;
    }

    const updated = await getFinalWishesByArchiveSlug(slug);
    if (!updated) throw new Error("Failed to load updated Final Wishes");
    return updated;
  }

  // Local JSON fallback
  let store: any = { archives: [], memories: [], legacyInstructions: [], finalWishes: [] };
  if (existsSync(storePath)) {
    store = JSON.parse(readFileSync(storePath, "utf8"));
  }
  if (!Array.isArray(store.finalWishes)) {
    store.finalWishes = [];
  }

  const existingIdx = store.finalWishes.findIndex((w: any) => w.archiveSlug === slug);
  const now = new Date().toISOString();

  const formattedSongs: FinalWishSong[] = songsInput.map((s, idx) => ({
    id: s.id || `song-${idx}-${Date.now()}`,
    archiveId: archive.id,
    title: s.title!.trim(),
    artist: s.artist?.trim() || null,
    url: s.url?.trim() || null,
    notes: s.notes?.trim() || null,
    sortOrder: idx,
    createdAt: s.createdAt || now,
    updatedAt: now
  }));

  const savedRecord: FinalWishes = {
    id: existingIdx >= 0 ? store.finalWishes[existingIdx].id : `wishes-${Date.now()}`,
    archiveId: archive.id,
    archiveSlug: slug,
    userId: "local-user-id",
    ...wishesInput,
    songs: formattedSongs,
    createdAt: existingIdx >= 0 ? store.finalWishes[existingIdx].createdAt : now,
    updatedAt: now
  };

  if (existingIdx >= 0) {
    store.finalWishes[existingIdx] = savedRecord;
  } else {
    store.finalWishes.push(savedRecord);
  }

  writeFileSync(storePath, JSON.stringify(store, null, 2));
  return savedRecord;
}
