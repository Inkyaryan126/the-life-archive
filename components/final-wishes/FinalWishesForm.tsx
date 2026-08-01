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
    <form onSubmit={handleSave} className="flex h-full flex-col font-serif text-[#2a1d10]">
      {/* Sticky Top Status & Save Header */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#a88d57]/30 bg-[#f4ece0]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#2a1d10] sm:text-xl">Final Wishes</h2>
          <p className="text-xs text-[#6e583c]">Preserve personal posthumous desires & playlist for {archiveName}</p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === "saved" && !isDirty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/30 bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800">
              ✓ Saved
            </span>
          ) : isDirty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/30 bg-amber-100/90 px-3 py-1 text-xs font-semibold text-amber-900">
              ● Unsaved changes
            </span>
          ) : null}

          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="rounded-full bg-[#7a5b28] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#fffdfa] shadow-md transition hover:bg-[#5e441c] active:scale-95 disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Final Wishes"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mx-4 mt-3 rounded-lg border border-red-400/40 bg-red-50 p-3 text-xs text-red-800 sm:mx-6">
          ⚠️ {errorMessage}
        </div>
      ) : null}

      {/* Main Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-8 sm:px-6">

        {/* 1. OVERVIEW */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            1. Overview & Guidance
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#5e4b33]">
            Record your personal preferences, music, contacts, and tribute details. This record ensures your loved ones have gentle, clear guidance when honoring your life.
          </p>
          <div className="mt-3 rounded-lg border border-[#a88a44]/30 bg-[#f3ebd9] p-3 text-xs font-sans italic text-[#594326]">
            <strong>Note:</strong> These wishes are personal instructions and are not a replacement for a legally valid will, advance directive, or other legal document.
          </div>
        </section>

        {/* 2. FUNERAL OR MEMORIAL PREFERENCES */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            2. Funeral or Memorial Preferences
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Service Preference
            </label>
            <select
              value={servicePreference}
              onChange={(e) => { setServicePreference(e.target.value as ServicePreference); markDirty(); }}
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none focus:ring-1 focus:ring-[#7a5b28]"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {servicePreference === "custom" ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
                Custom Service Description
              </label>
              <input
                type="text"
                value={serviceCustomDescription}
                onChange={(e) => { setServiceCustomDescription(e.target.value); markDirty(); }}
                placeholder="Describe your custom service vision..."
                className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Desired Location
            </label>
            <input
              type="text"
              value={serviceLocation}
              onChange={(e) => { setServiceLocation(e.target.value); markDirty(); }}
              placeholder="e.g. Family garden, St. Mark's Chapel, coastal overlook..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Traditions (Religious, Cultural, or Personal)
            </label>
            <textarea
              rows={2}
              value={traditions}
              onChange={(e) => { setTraditions(e.target.value); markDirty(); }}
              placeholder="Any specific rites, blessings, music, or cultural customs..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              General Atmosphere or Tone
            </label>
            <input
              type="text"
              value={serviceTone}
              onChange={(e) => { setServiceTone(e.target.value); markDirty(); }}
              placeholder="e.g. Joyful & intimate, reflective, acoustic music, bright colors..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Additional Service Instructions
            </label>
            <textarea
              rows={3}
              value={serviceInstructions}
              onChange={(e) => { setServiceInstructions(e.target.value); markDirty(); }}
              placeholder="Any additional details regarding the service..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:border-[#7a5b28] focus:outline-none"
            />
          </div>
        </section>

        {/* 3. FUNERAL PLAYLIST */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            3. Funeral Playlist
          </h3>

          <p className="text-xs text-[#5e4b33]">
            Curate meaningful songs to be played during the service, gathering, or quiet moments.
          </p>

          {/* Existing Songs List */}
          {songs.length > 0 ? (
            <div className="space-y-2">
              {songs.map((song, idx) => (
                <div
                  key={song.id || idx}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#c2aa7a] bg-[#fffcf7] p-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#3a2818]">#{idx + 1} {song.title}</span>
                    {song.artist ? <span className="ml-2 italic text-[#6e583c]">by {song.artist}</span> : null}
                    {song.notes ? <p className="mt-1 text-[0.7rem] text-[#5e4b33]">{song.notes}</p> : null}
                    {song.url ? (
                      <a href={song.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[0.7rem] text-[#7a5b28] underline">
                        {song.url}
                      </a>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSong(idx, "up")}
                      className="rounded border border-[#b89f6b] px-2 py-1 text-[0.65rem] font-bold disabled:opacity-30"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === songs.length - 1}
                      onClick={() => handleMoveSong(idx, "down")}
                      className="rounded border border-[#b89f6b] px-2 py-1 text-[0.65rem] font-bold disabled:opacity-30"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSong(idx)}
                      className="rounded border border-red-400/50 bg-red-50 px-2 py-1 text-[0.65rem] font-bold text-red-800 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-[#7a6448]">No songs added to the playlist yet.</p>
          )}

          {/* Add Song Form */}
          <div className="rounded-lg border border-[#b89f6b]/60 bg-[#f4ece0] p-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#594326]">Add a Song to Playlist</h4>

            {songError ? <p className="text-xs font-bold text-red-700">⚠️ {songError}</p> : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="Song Title *"
                className="rounded border border-[#b89f6b] bg-[#fffcf7] px-2.5 py-1.5 text-xs text-[#2a1d10] focus:outline-none"
              />
              <input
                type="text"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="Artist Name"
                className="rounded border border-[#b89f6b] bg-[#fffcf7] px-2.5 py-1.5 text-xs text-[#2a1d10] focus:outline-none"
              />
            </div>

            <input
              type="url"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              placeholder="Optional URL (Spotify, YouTube, Apple Music link...)"
              className="w-full rounded border border-[#b89f6b] bg-[#fffcf7] px-2.5 py-1.5 text-xs text-[#2a1d10] focus:outline-none"
            />

            <input
              type="text"
              value={newSongNotes}
              onChange={(e) => setNewSongNotes(e.target.value)}
              placeholder="Optional note (e.g. Play during family entry, favorite acoustic song...)"
              className="w-full rounded border border-[#b89f6b] bg-[#fffcf7] px-2.5 py-1.5 text-xs text-[#2a1d10] focus:outline-none"
            />

            <button
              type="button"
              onClick={handleAddSong}
              className="rounded-full bg-[#7a5b28] px-4 py-1.5 text-xs font-bold text-[#fffdfa] hover:bg-[#5e441c]"
            >
              + Add Song
            </button>
          </div>
        </section>

        {/* 4. BURIAL, CREMATION, OR OTHER WISHES */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            4. Burial, Cremation, or Other Wishes
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Disposition Preference
            </label>
            <select
              value={dispositionPreference}
              onChange={(e) => { setDispositionPreference(e.target.value as DispositionPreference); markDirty(); }}
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            >
              {dispositionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Cemetery, Location, or Resting Destination
            </label>
            <input
              type="text"
              value={dispositionLocation}
              onChange={(e) => { setDispositionLocation(e.target.value); markDirty(); }}
              placeholder="e.g. Oakridge Cemetery Plot 42, scattered at Sea Cliff..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Ashes Instructions (if cremated)
            </label>
            <textarea
              rows={2}
              value={ashesInstructions}
              onChange={(e) => { setAshesInstructions(e.target.value); markDirty(); }}
              placeholder="Instructions for urn, scattering, keepsake jewelry..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Organ or Body Donation Notes
            </label>
            <input
              type="text"
              value={donationNotes}
              onChange={(e) => { setDonationNotes(e.target.value); markDirty(); }}
              placeholder="Donor registry status or specific medical school instructions..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Additional Disposition Instructions
            </label>
            <textarea
              rows={2}
              value={dispositionInstructions}
              onChange={(e) => { setDispositionInstructions(e.target.value); markDirty(); }}
              placeholder="Any other specific wishes regarding burial or disposition..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>
        </section>

        {/* 5. PEOPLE AND ROLES */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            5. People and Key Roles
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
                Who Should Be Contacted First
              </label>
              <input
                type="text"
                value={firstContact}
                onChange={(e) => { setFirstContact(e.target.value); markDirty(); }}
                placeholder="Name, relationship, phone number..."
                className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
                Preferred Speaker or Officiant
              </label>
              <input
                type="text"
                value={preferredOfficiant}
                onChange={(e) => { setPreferredOfficiant(e.target.value); markDirty(); }}
                placeholder="Pastor, friend, family speaker..."
                className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Pallbearer Suggestions
            </label>
            <input
              type="text"
              value={pallbearerSuggestions}
              onChange={(e) => { setPallbearerSuggestions(e.target.value); markDirty(); }}
              placeholder="Names of suggested pallbearers..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              People You Want Involved
            </label>
            <textarea
              rows={2}
              value={peopleToInvolve}
              onChange={(e) => { setPeopleToInvolve(e.target.value); markDirty(); }}
              placeholder="Friends or relatives you'd love to read, speak, or assist..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              People Who Should NOT Be Responsible for Arrangements
            </label>
            <input
              type="text"
              value={peopleNotResponsible}
              onChange={(e) => { setPeopleNotResponsible(e.target.value); markDirty(); }}
              placeholder="Anyone who should be spared arrangement burden..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              General Contact or Responsibility Notes
            </label>
            <textarea
              rows={2}
              value={responsibilityNotes}
              onChange={(e) => { setResponsibilityNotes(e.target.value); markDirty(); }}
              placeholder="Additional guidance for your family..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>
        </section>

        {/* 6. OBITUARY AND LIFE DETAILS */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            6. Obituary and Life Details
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Preferred Name in Obituary
            </label>
            <input
              type="text"
              value={obituaryName}
              onChange={(e) => { setObituaryName(e.target.value); markDirty(); }}
              placeholder="Full name, nickname, or maiden name..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Important Relationships to Include
            </label>
            <textarea
              rows={2}
              value={obituaryRelationships}
              onChange={(e) => { setObituaryRelationships(e.target.value); markDirty(); }}
              placeholder="Spouse, children, grandchildren, siblings, mentors..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Accomplishments or Milestones to Mention
            </label>
            <textarea
              rows={2}
              value={obituaryAccomplishments}
              onChange={(e) => { setObituaryAccomplishments(e.target.value); markDirty(); }}
              placeholder="Career, military service, degrees, hobbies, lifelong passions..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Organizations, Causes, or Charities
            </label>
            <input
              type="text"
              value={obituaryCauses}
              onChange={(e) => { setObituaryCauses(e.target.value); markDirty(); }}
              placeholder="In lieu of flowers, donations may be made to..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Things That Should NOT Be Included
            </label>
            <input
              type="text"
              value={obituaryExclusions}
              onChange={(e) => { setObituaryExclusions(e.target.value); markDirty(); }}
              placeholder="Private details or topics to leave out of public obituary..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>
        </section>

        {/* 7. PERSONAL DETAILS */}
        <section className="rounded-xl border border-[#9b824d]/30 bg-[#faf5ec]/90 p-4 shadow-sm sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-[#453118] border-b border-[#bda675]/30 pb-2">
            7. Personal Touches & Final Message
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Clothing & Attire Preference
            </label>
            <input
              type="text"
              value={clothingPreference}
              onChange={(e) => { setClothingPreference(e.target.value); markDirty(); }}
              placeholder="Favorite suit, navy dress, casual linen, favorite hat..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Flowers, Photos, or Displayed Objects
            </label>
            <textarea
              rows={2}
              value={displayPreferences}
              onChange={(e) => { setDisplayPreferences(e.target.value); markDirty(); }}
              placeholder="White roses, family photo albums, favorite quilt or framed artwork..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Food, Drink, or Reception Preferences
            </label>
            <input
              type="text"
              value={gatheringPreferences}
              onChange={(e) => { setGatheringPreferences(e.target.value); markDirty(); }}
              placeholder="Italian comfort food, coffee & pastries, favorite wine toast..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Final Message or Closing Statement
            </label>
            <textarea
              rows={4}
              value={finalMessage}
              onChange={(e) => { setFinalMessage(e.target.value); markDirty(); }}
              placeholder="A lasting personal note to your family and friends..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#594326]">
              Any Other Wishes
            </label>
            <textarea
              rows={3}
              value={additionalWishes}
              onChange={(e) => { setAdditionalWishes(e.target.value); markDirty(); }}
              placeholder="Anything else you want your loved ones to know..."
              className="mt-1 w-full rounded-lg border border-[#b89f6b] bg-[#fffcf7] px-3 py-2 text-sm text-[#2a1d10] focus:outline-none"
            />
          </div>
        </section>

      </div>
    </form>
  );
}
