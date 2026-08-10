import Link from "next/link";

export default function ArtworkPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">Artwork Credits</p>
      <h1>Historical artwork and devotional prints.</h1>
      <p>
        Leela uses human-made historical paintings and devotional prints sourced from Wikimedia
        Commons. Images are resized, converted, and cropped responsively for the interface.
      </p>
      <ul>
        <li>Hero artwork: Wellcome Collection, CC BY 4.0.</li>
        <li>Several story images: public-domain devotional prints and historical paintings.</li>
      </ul>
      <p>
        The full editable credit list lives in <code>ARTWORK_CREDITS.md</code> in the project.
      </p>
    </main>
  );
}
