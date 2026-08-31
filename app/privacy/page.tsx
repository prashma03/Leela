import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="info-page">
      <Link href="/" className="info-back">Back to Leela</Link>
      <p className="eyebrow">Privacy</p>
      <h1>Privacy at Leela.</h1>
      <p>
        Leela is designed for adults and families. Adults choose whether to enter the Adult/Parent
        experience or open Kids Corner. Kids Corner does not ask a child for an email address or
        password.
      </p>
      <h2>Kids Corner</h2>
      <p>Kids Corner progress, mood choices, story-maker details, treasures, and kindness activities stay in local storage on that device. They are not sent to Leela&apos;s memory API while Kids Corner is active.</p>
      <p>Ask Leela, account settings, login, and signup are kept outside Kids Corner. Returning to the adult area requires an adult account action.</p>
      <h2>Adult accounts</h2>
      <p>When an adult creates or uses an account, Leela processes the supplied name, email address, password credential, saved items, and the information the adult chooses to keep. Server memory requests require an authenticated account.</p>
      <h2>Ask Leela</h2>
      <p>Ask Leela is an adult-area feature. A message may be sent to Leela&apos;s server and, when the hosted AI service is available, to that service to generate a response. Do not enter private, medical, financial, or identifying information.</p>
      <h2>Advertising and sales</h2>
      <p>Leela currently contains no advertising SDK, paid download, subscription, or in-app purchase.</p>
      <h2>Your choices</h2>
      <p>Local journey information can be cleared from My Journey. Adults can sign out at any time or <a href="/delete-account">permanently delete their account and saved server data</a>. This policy will be updated before broader testing if Leela&apos;s storage providers or data practices change.</p>
      <p><small>Last updated: August 31, 2026</small></p>
    </main>
  );
}
