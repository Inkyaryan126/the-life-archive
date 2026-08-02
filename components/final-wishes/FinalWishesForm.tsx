"use client";

import { useState, useEffect } from "react";
import { saveFinalWishesAction } from "@/app/dashboard/final-wishes/actions";
import type {
  FinalWishes,
  FinalWishSong,
  ServicePreference,
  DispositionPreference
} from "@/lib/types";

type FinalWishesFormProps = {
  archiveSlug: string;
  archiveName: string;
  initialWishes: FinalWishes | null;
};

const serviceOptions: Array<{ value: ServicePreference; label: string }> = [
  { value: "funeral", label: "Traditional Funeral" },
  { value: "memorial", label: "Memorial Service" },
  { value: "celebration_of_life", label: "Celebration of Life" },
  { value: "private_gathering", label: "Private Family Gathering" },
  { value: "no_formal_service", label: "No Formal Service" },
  { value: "undecided", label: "Undecided" },
  { value: "custom", label: "Custom Service" }
];

const dispositionOptions: Array<{ value: DispositionPreference; label: string }> = [
  { value: "burial", label: "Traditional Burial" },
  { value: "cremation", label: "Cremation" },
  { value: "green_burial", label: "Green / Natural Burial" },
  { value: "donation", label: "Medical / Anatomical Donation" },
  { value: "undecided", label: "Undecided" },
  { value: "custom", label: "Custom Disposition" }
];

export function FinalWishesForm({
  archiveSlug,
  archiveName,
  initialWishes
}: FinalWishesFormProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [servicePreference, setServicePreference] = useState<ServicePreference>(
    initialWishes?.servicePreference || "undecided"
  );
  const [serviceCustomDescription, setServiceCustomDescription] = useState(
    initialWishes?.serviceCustomDescription || ""
  );
  const [serviceLocation, setServiceLocation] = useState(initialWishes?.serviceLocation || "");
  const [traditions, setTraditions] = useState(initialWishes?.traditions || "");
  const [serviceTone, setServiceTone] = useState(initialWishes?.serviceTone || "");
  const [serviceInstructions, setServiceInstructions] = useState(
    initialWishes?.serviceInstructions || ""
  );

  const [dispositionPreference, setDispositionPreference] = useState<DispositionPreference>(
    initialWishes?.dispositionPreference || "undecided"
  );
  const [dispositionLocation, setDispositionLocation] = useState(
    initialWishes?.dispositionLocation || ""
  );
  const [ashesInstructions, setAshesInstructions] = useState(
    initialWishes?.ashesInstructions || ""
  );
  const [donationNotes, setDonationNotes] = useState(initialWishes?.donationNotes || "");
  const [dispositionInstructions, setDispositionInstructions] = useState(
    initialWishes?.dispositionInstructions || ""
  );

  const [firstContact, setFirstContact] = useState(initialWishes?.firstContact || "");
  const [preferredOfficiant, setPreferredOfficiant] = useState(
    initialWishes?.preferredOfficiant || ""
  );
  const [pallbearerSuggestions, setPallbearerSuggestions] = useState(
    initialWishes?.pallbearerSuggestions || ""
  );
  const [peopleToInvolve, setPeopleToInvolve] = useState(initialWishes?.peopleToInvolve || "");
  const [peopleNotResponsible, setPeopleNotResponsible] = useState(
    initialWishes?.peopleNotResponsible || ""
  );
  const [responsibilityNotes, setResponsibilityNotes] = useState(
    initialWishes?.responsibilityNotes || ""
  );

  const [obituaryName, setObituaryName] = useState(initialWishes?.obituaryName || "");
  const [obituaryRelationships, setObituaryRelationships] = useState(
    initialWishes?.obituaryRelationships || ""
  );
  const [obituaryAccomplishments, setObituaryAccomplishments] = useState(
    initialWishes?.obituaryAccomplishments || ""
  );
  const [obituaryCauses, setObituaryCauses] = useState(initialWishes?.obituaryCauses || "");
  const [obituaryNotes, setObituaryNotes] = useState(initialWishes?.obituaryNotes || "");
  const [obituaryExclusions, setObituaryExclusions] = useState(
    initialWishes?.obituaryExclusions || ""
  );

  const [clothingPreference, setClothingPreference] = useState(
    initialWishes?.clothingPreference || ""
  );
  const [displayPreferences, setDisplayPreferences] = useState(
    initialWishes?.displayPreferences || ""
  );
  const [gatheringPreferences, setGatheringPreferences] = useState(
    initialWishes?.gatheringPreferences || ""
  );
  const [finalMessage, setFinalMessage] = useState(initialWishes?.finalMessage || "");
  const [additionalWishes, setAdditionalWishes] = useState(initialWishes?.additionalWishes || "");

  // Playlist state
  const [songs, setSongs] = useState<Array<Partial<FinalWishSong>>>(
    initialWishes?.songs || []
  );

  // New Song Draft State
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [newSongNotes, setNewSongNotes] = useState("");
  const [songError, setSongError] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  // Warn on unsaved changes before page navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    setIsDirty(true);
    setSaveStatus("idle");
    setErrorMessage(null);
  };

  const handleAddSong = () => {
    setSongError(null);
    const trimmedTitle = newSongTitle.trim();
    if (!trimmedTitle) {
      setSongError("Song title is required.");
      return;
    }

    const nextSong: Partial<FinalWishSong> = {
      id: `temp-${Date.now()}`,
      title: trimmedTitle,
      artist: newSongArtist.trim() || undefined,
      url: newSongUrl.trim() || undefined,
      notes: newSongNotes.trim() || undefined,
      sortOrder: songs.length
    };

    setSongs([...songs, nextSong]);
    setNewSongTitle("");
    setNewSongArtist("");
    setNewSongUrl("");
    setNewSongNotes("");
    markDirty();
  };

  const handleRemoveSong = (index: number) => {
    const updated = songs.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i }));
    setSongs(updated);
    markDirty();
  };

  const handleMoveSong = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= songs.length) return;

    const updated = [...songs];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((s, i) => ({ ...s, sortOrder: i }));
    setSongs(reordered);
    markDirty();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setErrorMessage(null);

    const wishesData: Omit<Partial<FinalWishes>, "id" | "archiveId" | "userId" | "songs"> = {
      servicePreference,
      serviceCustomDescription,
      serviceLocation,
      traditions,
      serviceTone,
      serviceInstructions,
      dispositionPreference,
      dispositionLocation,
      ashesInstructions,
      donationNotes,
      dispositionInstructions,
      firstContact,
      preferredOfficiant,
      pallbearerSuggestions,
      peopleToInvolve,
      peopleNotResponsible,
      responsibilityNotes,
      obituaryName,
      obituaryRelationships,
      obituaryAccomplishments,
      obituaryCauses,
      obituaryNotes,
      obituaryExclusions,
      clothingPreference,
      displayPreferences,
      gatheringPreferences,
      finalMessage,
      additionalWishes
    };

    const res = await saveFinalWishesAction(archiveSlug, wishesData, songs);

    if (res.success) {
      setSaveStatus("saved");
      setIsDirty(false);
    } else {
      setSaveStatus("error");
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="relative flex h-full flex-col font-serif text-[#2c1a0e] bg-transparent selection:bg-[#c5a059]/30">
      {/* Integrated Header / Top Bar on Parchment (Fixed Safe Centered Column) */}
      <div className="mx-auto w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 border-b border-[#7a5b28]/25 bg-transparent px-5 py-2">
        <div>
          <h2 className="font-serif text-sm font-bold tracking-wide text-[#2c1a0e]">Final Wishes</h2>
          <p className="text-[0.65rem] font-serif text-[#5e472a]">For {archiveName}</p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saved" && !isDirty ? (
            <span className="text-[0.68rem] font-serif font-bold text-[#2e5a1c]">✓ Saved</span>
          ) : isDirty ? (
            <span className="text-[0.68rem] font-serif font-bold text-[#8b4513]">● Unsaved</span>
          ) : null}

          <button
            type="button"
            onClick={(e) => handleSave(e as any)}
            disabled={saveStatus === "saving"}
            className="rounded-full bg-[#4a321a] px-3.5 py-1 text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#f7f2e8] border border-[#9b7b38]/40 shadow-sm transition hover:bg-[#332110] active:scale-95 disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Wishes"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mx-auto w-full max-w-[560px] my-2 text-xs font-bold text-red-900 border-b border-red-800/30 pb-1 px-5">
          ⚠️ {errorMessage}
        </div>
      ) : null}

      {/* Top & Bottom Subtle Parchment Scroll Edge Fades */}
      <div className="pointer-events-none absolute top-10 left-0 right-0 h-3 bg-gradient-to-b from-[#dfd0b5]/50 via-[#dfd0b5]/20 to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#cbb792]/50 via-[#cbb792]/20 to-transparent z-10" />

      {/* Scrollable Form Body (Hidden Native Scrollbar, Fixed Safe Rectangular Content Column) */}
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-3 pb-4 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-[560px] px-5 space-y-5">

        {/* 1. OVERVIEW */}
        <section className="space-y-2 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">1.</span>
            <span>Overview & Guidance</span>
          </h3>
          <p className="text-[0.75rem] leading-relaxed text-[#4a3525]">
            Record your personal preferences, music, contacts, and tribute details. This record ensures your loved ones have gentle, clear guidance when honoring your life.
          </p>
          <p className="text-[0.72rem] italic text-[#5e472a]">
            Note: These wishes are personal instructions and are not a replacement for a legally valid will or advance directive.
          </p>
        </section>

        {/* 2. FUNERAL OR MEMORIAL PREFERENCES */}
        <section className="space-y-2.5 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">2.</span>
            <span>Funeral or Memorial Preferences</span>
          </h3>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Service Preference
            </label>
            <select
              value={servicePreference}
              onChange={(e) => { setServicePreference(e.target.value as ServicePreference); markDirty(); }}
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#ded0b6] text-[#2c1a0e]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {servicePreference === "custom" ? (
            <div>
              <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
                Custom Service Description
              </label>
              <input
                type="text"
                value={serviceCustomDescription}
                onChange={(e) => { setServiceCustomDescription(e.target.value); markDirty(); }}
                placeholder="Describe your custom service vision..."
                className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Desired Location
            </label>
            <input
              type="text"
              value={serviceLocation}
              onChange={(e) => { setServiceLocation(e.target.value); markDirty(); }}
              placeholder="e.g. Family garden, St. Mark's Chapel..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Traditions (Religious, Cultural, or Personal)
            </label>
            <textarea
              rows={2}
              value={traditions}
              onChange={(e) => { setTraditions(e.target.value); markDirty(); }}
              placeholder="Any specific rites, blessings, music..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              General Atmosphere or Tone
            </label>
            <input
              type="text"
              value={serviceTone}
              onChange={(e) => { setServiceTone(e.target.value); markDirty(); }}
              placeholder="e.g. Joyful & intimate, reflective..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Additional Service Instructions
            </label>
            <textarea
              rows={2}
              value={serviceInstructions}
              onChange={(e) => { setServiceInstructions(e.target.value); markDirty(); }}
              placeholder="Any additional details regarding the service..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* 3. FUNERAL PLAYLIST */}
        <section className="space-y-2.5 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">3.</span>
            <span>Funeral Playlist</span>
          </h3>

          <p className="text-[0.75rem] text-[#4a3525]">
            Curate meaningful songs to be played during the service or gathering.
          </p>

          {/* Existing Songs List */}
          {songs.length > 0 ? (
            <div className="space-y-1.5">
              {songs.map((song, idx) => (
                <div
                  key={song.id || idx}
                  className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#7a5b28]/20 py-1 text-xs font-serif"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#2c1a0e]">#{idx + 1} {song.title}</span>
                    {song.artist ? <span className="ml-1.5 italic text-[#5e472a]">by {song.artist}</span> : null}
                    {song.notes ? <p className="text-[0.68rem] text-[#4a3525]">{song.notes}</p> : null}
                    {song.url ? (
                      <a href={song.url} target="_blank" rel="noopener noreferrer" className="block truncate text-[0.68rem] text-[#8b6b2e] underline">
                        {song.url}
                      </a>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSong(idx, "up")}
                      className="text-[#7a5b28] hover:text-[#4a321a] px-1 text-[0.65rem] font-bold disabled:opacity-20"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === songs.length - 1}
                      onClick={() => handleMoveSong(idx, "down")}
                      className="text-[#7a5b28] hover:text-[#4a321a] px-1 text-[0.65rem] font-bold disabled:opacity-20"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSong(idx)}
                      className="text-red-900 hover:underline px-1 text-[0.65rem] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[0.72rem] italic text-[#5e472a]">No songs added to the playlist yet.</p>
          )}

          {/* Add Song Form */}
          <div className="pt-1 space-y-2">
            <h4 className="text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525]">Add a Song</h4>

            {songError ? <p className="text-xs font-bold text-red-900">⚠️ {songError}</p> : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="Song Title *"
                className="bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
              />
              <input
                type="text"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="Artist Name"
                className="bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
              />
            </div>

            <input
              type="url"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              placeholder="Optional URL (Spotify, YouTube, Apple Music...)"
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />

            <input
              type="text"
              value={newSongNotes}
              onChange={(e) => setNewSongNotes(e.target.value)}
              placeholder="Optional note (e.g. Play during family entry...)"
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleAddSong}
              className="text-[#7a5b28] hover:text-[#4a321a] text-xs font-serif font-bold underline transition pt-1"
            >
              + Add Song to Playlist
            </button>
          </div>
        </section>

        {/* 4. BURIAL, CREMATION, OR OTHER WISHES */}
        <section className="space-y-2.5 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">4.</span>
            <span>Burial, Cremation, or Other Wishes</span>
          </h3>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Disposition Preference
            </label>
            <select
              value={dispositionPreference}
              onChange={(e) => { setDispositionPreference(e.target.value as DispositionPreference); markDirty(); }}
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            >
              {dispositionOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#ded0b6] text-[#2c1a0e]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Cemetery, Location, or Resting Destination
            </label>
            <input
              type="text"
              value={dispositionLocation}
              onChange={(e) => { setDispositionLocation(e.target.value); markDirty(); }}
              placeholder="e.g. Oakridge Cemetery Plot 42..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Ashes Instructions (if cremated)
            </label>
            <textarea
              rows={2}
              value={ashesInstructions}
              onChange={(e) => { setAshesInstructions(e.target.value); markDirty(); }}
              placeholder="Instructions for urn, scattering, keepsake jewelry..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Organ or Body Donation Notes
            </label>
            <input
              type="text"
              value={donationNotes}
              onChange={(e) => { setDonationNotes(e.target.value); markDirty(); }}
              placeholder="Donor registry status or specific medical instructions..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Additional Disposition Instructions
            </label>
            <textarea
              rows={2}
              value={dispositionInstructions}
              onChange={(e) => { setDispositionInstructions(e.target.value); markDirty(); }}
              placeholder="Any other specific wishes regarding burial or disposition..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* 5. PEOPLE AND ROLES */}
        <section className="space-y-2.5 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">5.</span>
            <span>People and Key Roles</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
                Who Should Be Contacted First
              </label>
              <input
                type="text"
                value={firstContact}
                onChange={(e) => { setFirstContact(e.target.value); markDirty(); }}
                placeholder="Name, relationship, phone number..."
                className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
                Preferred Speaker or Officiant
              </label>
              <input
                type="text"
                value={preferredOfficiant}
                onChange={(e) => { setPreferredOfficiant(e.target.value); markDirty(); }}
                placeholder="Pastor, friend, family speaker..."
                className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Pallbearer Suggestions
            </label>
            <input
              type="text"
              value={pallbearerSuggestions}
              onChange={(e) => { setPallbearerSuggestions(e.target.value); markDirty(); }}
              placeholder="Names of suggested pallbearers..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              People You Want Involved
            </label>
            <textarea
              rows={2}
              value={peopleToInvolve}
              onChange={(e) => { setPeopleToInvolve(e.target.value); markDirty(); }}
              placeholder="Friends or relatives you'd love to read, speak, or assist..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              People Who Should NOT Be Responsible for Arrangements
            </label>
            <input
              type="text"
              value={peopleNotResponsible}
              onChange={(e) => { setPeopleNotResponsible(e.target.value); markDirty(); }}
              placeholder="Anyone who should be spared arrangement burden..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              General Contact or Responsibility Notes
            </label>
            <textarea
              rows={2}
              value={responsibilityNotes}
              onChange={(e) => { setResponsibilityNotes(e.target.value); markDirty(); }}
              placeholder="Additional guidance for your family..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* 6. OBITUARY AND LIFE DETAILS */}
        <section className="space-y-2.5 pb-4 border-b border-[#7a5b28]/25">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">6.</span>
            <span>Obituary and Life Details</span>
          </h3>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Preferred Name in Obituary
            </label>
            <input
              type="text"
              value={obituaryName}
              onChange={(e) => { setObituaryName(e.target.value); markDirty(); }}
              placeholder="Full name, nickname, or maiden name..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Important Relationships to Include
            </label>
            <textarea
              rows={2}
              value={obituaryRelationships}
              onChange={(e) => { setObituaryRelationships(e.target.value); markDirty(); }}
              placeholder="Spouse, children, grandchildren, siblings, mentors..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Accomplishments or Milestones to Mention
            </label>
            <textarea
              rows={2}
              value={obituaryAccomplishments}
              onChange={(e) => { setObituaryAccomplishments(e.target.value); markDirty(); }}
              placeholder="Career, military service, degrees, hobbies..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Organizations, Causes, or Charities
            </label>
            <input
              type="text"
              value={obituaryCauses}
              onChange={(e) => { setObituaryCauses(e.target.value); markDirty(); }}
              placeholder="In lieu of flowers, donations may be made to..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Things That Should NOT Be Included
            </label>
            <input
              type="text"
              value={obituaryExclusions}
              onChange={(e) => { setObituaryExclusions(e.target.value); markDirty(); }}
              placeholder="Private details or topics to leave out..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>
        </section>

        {/* 7. PERSONAL TOUCHES */}
        <section className="space-y-2.5 pb-2">
          <h3 className="font-serif text-xs font-bold text-[#2c1a0e] border-b border-[#7a5b28]/20 pb-1 flex items-center gap-1.5">
            <span className="text-[#8b6b2e] font-bold">7.</span>
            <span>Personal Touches & Final Message</span>
          </h3>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Clothing & Attire Preference
            </label>
            <input
              type="text"
              value={clothingPreference}
              onChange={(e) => { setClothingPreference(e.target.value); markDirty(); }}
              placeholder="Favorite suit, navy dress, casual linen..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Flowers, Photos, or Displayed Objects
            </label>
            <textarea
              rows={2}
              value={displayPreferences}
              onChange={(e) => { setDisplayPreferences(e.target.value); markDirty(); }}
              placeholder="White roses, family photo albums, favorite quilt..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Food, Drink, or Reception Preferences
            </label>
            <input
              type="text"
              value={gatheringPreferences}
              onChange={(e) => { setGatheringPreferences(e.target.value); markDirty(); }}
              placeholder="Italian comfort food, coffee & pastries..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Final Message or Closing Statement
            </label>
            <textarea
              rows={3}
              value={finalMessage}
              onChange={(e) => { setFinalMessage(e.target.value); markDirty(); }}
              placeholder="A lasting personal note to your family and friends..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-serif font-bold uppercase tracking-wider text-[#4a3525] mb-0.5">
              Any Other Wishes
            </label>
            <textarea
              rows={2}
              value={additionalWishes}
              onChange={(e) => { setAdditionalWishes(e.target.value); markDirty(); }}
              placeholder="Anything else you want your loved ones to know..."
              className="w-full bg-transparent border-b border-[#7a5b28]/40 border-t-0 border-l-0 border-r-0 rounded-none px-1 py-1 text-xs font-serif text-[#2c1a0e] placeholder-[#6b4a2f] focus:border-[#7a5b28] focus:ring-0 focus:outline-none resize-none"
            />
          </div>
        </section>

        </div>
      </form>
    </div>
  );
}
