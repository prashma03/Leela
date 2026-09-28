export type KrishnaFactReply = {
  text: string;
  mode: "local-factual";
};

const facts = [
  {
    pattern: /\bpandavas?\b|\bpandavs?\b|\bpandava brothers\b/,
    text:
      "The Pandavas were the five brothers at the center of the Mahabharata: Yudhishthira, Bhima, Arjuna, Nakula, and Sahadeva.\n\nThey were the sons of King Pandu. Krishna was their close friend and guide, especially to Arjuna in the Bhagavad Gita.",
  },
  {
    pattern: /\bkauravas?\b|\bkouravas?\b/,
    text:
      "The Kauravas were the cousins and rivals of the Pandavas in the Mahabharata. The best-known Kaurava is Duryodhana.\n\nTheir conflict with the Pandavas leads to the Kurukshetra war.",
  },
  {
    pattern: /\barjuna\b/,
    text:
      "Arjuna was one of the five Pandavas and a great archer in the Mahabharata.\n\nIn the Bhagavad Gita, Krishna guides Arjuna when he feels confused and overwhelmed before the Kurukshetra war.",
  },
  {
    pattern: /\bdraupadi\b/,
    text:
      "Draupadi was a central queen in the Mahabharata and the wife of the five Pandavas.\n\nShe is remembered for her courage, dignity, and important role in the events that led toward the Kurukshetra war.",
  },
  {
    pattern: /\bkrishna\b|\bshri krishna\b|\bsri krishna\b/,
    text:
      "Krishna is a central divine figure in Hindu tradition. In Leela’s stories, he appears as the playful child of Vrindavan, the friend and guide of the Pandavas, and the teacher of the Bhagavad Gita.",
  },
  {
    pattern: /\bbhagavad gita\b|\bgita\b/,
    text:
      "The Bhagavad Gita is a teaching from the Mahabharata. It is a conversation between Krishna and Arjuna before the Kurukshetra war.\n\nIt explores duty, devotion, wisdom, action, and inner steadiness.",
  },
  {
    pattern: /\bmahabharata\b|\bmahabharat\b/,
    text:
      "The Mahabharata is a major Indian epic about the Pandavas, the Kauravas, dharma, family conflict, and the Kurukshetra war.\n\nThe Bhagavad Gita appears within the Mahabharata.",
  },
  {
    pattern: /\bkurukshetra\b/,
    text:
      "Kurukshetra is the battlefield where the great war of the Mahabharata takes place.\n\nIt is also where Krishna teaches Arjuna the Bhagavad Gita.",
  },
  {
    pattern: /\bradha\b/,
    text:
      "Radha is deeply associated with Krishna in devotional traditions, especially as a symbol of love and devotion.\n\nStories of Radha and Krishna are especially connected with Vrindavan and bhakti.",
  },
  {
    pattern: /\bbalarama\b|\bbalram\b/,
    text:
      "Balarama is Krishna’s older brother. He is often shown as strong, protective, and closely connected with Krishna’s childhood stories.",
  },
  {
    pattern: /\byashoda\b|\byasoda\b/,
    text:
      "Mother Yashoda is Krishna’s foster mother in Gokul and Vrindavan stories.\n\nShe is remembered for her loving care, especially in childhood stories like Krishna stealing butter.",
  },
  {
    pattern: /\bdevaki\b/,
    text:
      "Devaki is Krishna’s birth mother. In Krishna’s birth story, she and Vasudeva are imprisoned by Kamsa before Krishna is secretly carried to safety.",
  },
  {
    pattern: /\bvasudeva\b|\bvasudev\b/,
    text:
      "Vasudeva is Krishna’s birth father. In the birth story, he carries baby Krishna across the Yamuna to protect him from Kamsa.",
  },
  {
    pattern: /\bkamsa\b|\bkansa\b/,
    text:
      "Kamsa is the ruler who fears Krishna’s birth and becomes an enemy in Krishna’s early story.\n\nKrishna is born while his parents are imprisoned by Kamsa.",
  },
  {
    pattern: /\bvrindavan\b|\bvrindavana\b|\bgokul\b/,
    text:
      "Vrindavan and Gokul are places closely tied to Krishna’s childhood stories: cows, flute music, butter, friends, and playful leelas.",
  },
  {
    pattern: /\bdharma\b/,
    text:
      "Dharma means the right way to live and act, guided by duty, truth, care, and responsibility.\n\nIn the Mahabharata and the Gita, dharma can be difficult because the right action is not always simple.",
  },
  {
    pattern: /\bkarma\b/,
    text:
      "Karma means action and the results connected with action.\n\nIn the Gita, Krishna teaches that we should act with care and sincerity without becoming controlled by the results.",
  },
] as const;

export function isFactualQuestion(message: string): boolean {
  const clean = normalize(message);
  return /^(who|what|where|when|why|how|tell me about|explain|define)\b/.test(clean)
    || /\b(who is|who are|what is|what are|where is|where are|tell me about|explain|define)\b/.test(clean);
}

function normalize(message: string) {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function getKrishnaFactReply(message: string): KrishnaFactReply | null {
  const clean = normalize(message);
  if (!isFactualQuestion(clean)) return null;

  const fact = facts.find((item) => item.pattern.test(clean));
  if (fact) return { text: fact.text, mode: "local-factual" };
  return null;
}
