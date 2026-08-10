import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">Privacy</p>
      <h1>A calm, minimal first version.</h1>
      <p>
        Leela stores saved stories, reflections, kid profile fields, and progress mainly in this
        browser&apos;s local storage. Optional account features are only for keeping a journey across
        sessions.
      </p>
      <p>
        Children should not share private personal information in Ask Leela.
      </p>
    </main>
  );
}
