import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">About Leela</p>
      <h1>Krishna stories and Gita wisdom, made gentle.</h1>
      <p>
        Leela is an educational app for exploring Krishna stories, simplified Bhagavad Gita
        reflections, read-aloud moments, and a kid-friendly devotional learning space.
      </p>
      <p>
        The Gita material is approachable paraphrase for learning, not a literal Sanskrit
        translation or a substitute for scholarly study.
      </p>
    </main>
  );
}
