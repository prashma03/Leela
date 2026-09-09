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
        <li>
          Welcome artwork: <a href="https://commons.wikimedia.org/wiki/File:BhagavadGita-19th-century-Illustrated-Sanskrit-Chapter_1.20.21.jpg">illustrated nineteenth-century Bhagavad Gita manuscript</a>, public domain.
        </li>
        <li>
          Welcome artwork: <a href="https://commons.wikimedia.org/wiki/File:Krishna_and_Arjun_on_the_chariot,_Mahabharata,_18th-19th_century,_India.jpg">Krishna and Arjuna on the chariot</a>, eighteenth–nineteenth century, public domain.
        </li>
        <li>
          Welcome artwork: <a href="https://commons.wikimedia.org/wiki/File:ParthasarathyAtTriplicane.JPG">Parthasarathy temple carving</a>, public domain.
        </li>
      </ul>
      <p>
        The full editable credit list lives in <code>ARTWORK_CREDITS.md</code> in the project.
      </p>
    </main>
  );
}
