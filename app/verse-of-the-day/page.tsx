import Link from "next/link";
import VerseOfTheDay from "../components/VerseOfTheDay";
import { bhagavadGita } from "../data/bhagavadGita";
import NotificationControl from "./notification-control";

export default async function VerseOfTheDayPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const { saved } = await searchParams;
  const entry = typeof saved === "string" ? bhagavadGita.find(item => item.id === saved) : undefined;
  return <main className="daily-verse-page">
    <Link href="/">← Back to Leela</Link>
    <div className="daily-verse-page-content">
      <VerseOfTheDay headingLevel={1} showDailyLink={false} entry={entry} />
      {entry && <Link className="daily-verse-return" href="/verse-of-the-day">Return to today’s reflection →</Link>}
      <NotificationControl />
    </div>
  </main>;
}
