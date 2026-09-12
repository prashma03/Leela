import Link from "next/link";
import VerseOfTheDay from "../components/VerseOfTheDay";
import { bhagavadGita } from "../data/bhagavadGita";
import NotificationControl from "./notification-control";
import WidgetControl from "./widget-control";

export default async function VerseOfTheDayPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const { saved } = await searchParams;
  const entry = typeof saved === "string" ? bhagavadGita.find(item => item.id === saved) : undefined;
  const deeperMeaning = entry ? [
    `This teaching is less about escaping responsibility and more about refining the quality of attention. ${entry.reflection}`,
    "Read as a daily practice, it asks the heart to become both tender and disciplined: tender enough to remain compassionate, and disciplined enough not to be dragged by every fear, praise, delay, or disappointment.",
    "A simple way to carry it today is to choose one action you can do with sincerity, complete it without theatrics, and let the result arrive without giving it ownership of your peace.",
  ] : [];
  return <main className="daily-verse-page">
    <Link href="/">← Back to Leela</Link>
    <div className="daily-verse-page-content">
      <VerseOfTheDay headingLevel={1} showDailyLink={false} entry={entry} />
      {entry && <section className="verse-deeper-meaning" aria-label="Detailed verse meaning">
        <p className="eyebrow">Deeper meaning</p>
        <h2>How this verse can live in your day</h2>
        {deeperMeaning.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </section>}
      {entry && <Link className="daily-verse-return" href="/verse-of-the-day">Return to today’s reflection →</Link>}
      <NotificationControl />
      <WidgetControl />
    </div>
  </main>;
}
