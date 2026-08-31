"use client";

import Link from "next/link";
import { useState } from "react";

const localJourneyKeys = ["leelaSaved", "leelaKidMood", "leelaGoodDeeds", "leelaKidName", "leelaKidAnimal", "leelaKidActivity", "leelaTreasures", "leelaAutoVoice", "leelaEntrySeen"];

export default function DeleteAccountPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    if (!window.confirm("Permanently delete your Leela account and saved server data? This cannot be undone.")) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth?deleteAccount=true", { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to delete the account.");
      localJourneyKeys.forEach((key) => window.localStorage.removeItem(key));
      setStatus("Your Leela account and saved journey data were deleted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to delete the account.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="legal-page">
    <Link href="/">← Back to Leela</Link>
    <p className="eyebrow">Account and privacy</p>
    <h1>Delete your Leela account</h1>
    <p>This page is for an adult account holder. Sign in to Leela in this browser before continuing.</p>
    <h2>What will be deleted</h2>
    <p>Your account, email, password credential, active sessions, and saved server journey data will be permanently removed. Journey data stored only in this browser will also be cleared.</p>
    <h2>What will not be affected</h2>
    <p>Leela&apos;s public stories and educational content are not connected to your account. A demo visit does not create a personal account and cannot be deleted.</p>
    <button className="delete-account-button" type="button" onClick={deleteAccount} disabled={busy}>{busy ? "Deleting…" : "Permanently delete my account"}</button>
    {status && <p role="status" aria-live="polite">{status}</p>}
  </main>;
}
