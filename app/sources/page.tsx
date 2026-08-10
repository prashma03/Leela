import Link from "next/link";

export default function SourcesPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">Sources</p>
      <h1>How Leela handles sacred content.</h1>
      <p>
        Krishna stories are written as gentle educational retellings inspired by devotional
        storytelling traditions. Bhagavad Gita content is simplified into modern English
        explanations and always shown with a reference when a verse idea is used.
      </p>
      <p>
        Leela does not generate Sanskrit verses or present paraphrases as literal translation.
      </p>
    </main>
  );
}
