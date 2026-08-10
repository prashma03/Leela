import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">Terms</p>
      <h1>Educational use.</h1>
      <p>
        Leela is a learning and reflection project. Its stories, Gita paraphrases, and AI responses
        are educational and devotional in tone, not medical, legal, crisis, or professional advice.
      </p>
      <p>
        Ask Leela should stay grounded in the app&apos;s curated content and should not be treated as a
        literal religious authority.
      </p>
    </main>
  );
}
