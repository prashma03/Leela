export type MantraEntry = {
  id: string;
  title: string;
  context: string;
  devanagari: string;
  roman: string;
  meaning: string;
  source: string;
  sourceUrl: string;
};

/**
 * Carefully curated Sanskrit recitations. Roman text uses approachable,
 * diacritic-free spelling for readers who asked for Sanskrit in English letters.
 * Meanings are Leela's concise explanations, not literal translations.
 */
export const mantras: readonly MantraEntry[] = [
  {
    id: "maha-mantra", title: "Hare Krishna Maha-mantra", context: "Devotion and remembrance",
    devanagari: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥",
    roman: "Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare\nHare Rama, Hare Rama, Rama Rama, Hare Hare",
    meaning: "A devotional repetition of the sacred names Hare, Krishna, and Rama.",
    source: "Kali-Santarana Upanishad — traditional Gaudiya Vaishnava order",
    sourceUrl: "https://en.wikipedia.org/wiki/Kali-Santara%E1%B9%87a_Upani%E1%B9%A3ad",
  },
  {
    id: "gita-2-47-recitation", title: "Steady action", context: "Work without clinging",
    devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    roman: "Karmany evadhikaras te ma phaleshu kadachana\nMa karma-phala-hetur bhur ma te sango 'stv akarmani",
    meaning: "Give yourself fully to right action without making its reward the only reason you act.",
    source: "Bhagavad Gita 2.47",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=2&field_nsutra_value=47&language=dv",
  },
  {
    id: "gita-4-7-recitation", title: "The return of dharma", context: "Hope and restoration",
    devanagari: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदाऽऽत्मानं सृजाम्यहम् ॥",
    roman: "Yada yada hi dharmasya glanir bhavati Bharata\nAbhyutthanam adharmasya tadatmanam srijamy aham",
    meaning: "When dharma declines and harm rises, the divine presence restores balance.",
    source: "Bhagavad Gita 4.7",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=4&field_nsutra_value=7&language=dv",
  },
  {
    id: "gita-4-8-recitation", title: "Dharma through every age", context: "Protection and courage",
    devanagari: "परित्राणाय साधूनां विनाशाय च दुष्कृताम् । धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥",
    roman: "Paritranaya sadhunam vinashaya cha dushkritam\nDharma-samsthapanarthaya sambhavami yuge yuge",
    meaning: "The divine works to protect goodness, confront harm, and re-establish dharma.",
    source: "Bhagavad Gita 4.8",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=4&field_nsutra_value=8&language=dv",
  },
  {
    id: "gita-6-5-recitation", title: "Become your own friend", context: "Inner strength",
    devanagari: "उद्धरेदात्मनाऽऽत्मानं नात्मानमवसादयेत् । आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
    roman: "Uddhared atmanatmanam natmanam avasadayet\nAtmaiva hy atmano bandhur atmaiva ripur atmanah",
    meaning: "Train the mind to lift you rather than pull you downward; your inner life can become an ally.",
    source: "Bhagavad Gita 6.5",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=6&field_nsutra_value=5&language=dv",
  },
  {
    id: "gita-9-22-recitation", title: "Held in devotion", context: "Trust and steadiness",
    devanagari: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते । तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥",
    roman: "Ananyash chintayanto mam ye janah paryupasate\nTesham nityabhiyuktanam yoga-kshemam vahamy aham",
    meaning: "Krishna speaks of caring for those who remain steadily devoted and remember the divine.",
    source: "Bhagavad Gita 9.22",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=9&field_nsutra_value=22&language=dv",
  },
  {
    id: "gita-17-23-recitation", title: "Om Tat Sat", context: "Sacred intention",
    devanagari: "ॐ तत्सदिति निर्देशो ब्रह्मणस्त्रिविधः स्मृतः । ब्राह्मणास्तेन वेदाश्च यज्ञाश्च विहिताः पुरा ॥",
    roman: "Om Tat Sad iti nirdesho brahmanas tri-vidhah smritah\nBrahmanas tena vedash cha yajnas cha vihitah pura",
    meaning: "Om, Tat, and Sat are remembered as three sacred expressions pointing toward ultimate reality.",
    source: "Bhagavad Gita 17.23",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=17&field_nsutra_value=23&language=dv",
  },
  {
    id: "gita-18-66-recitation", title: "Take refuge", context: "Surrender and reassurance",
    devanagari: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज । अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥",
    roman: "Sarva-dharman parityajya mam ekam sharanam vraja\nAham tvam sarva-papebhyo mokshayishyami ma shuchah",
    meaning: "Krishna closes with an invitation to take refuge in the divine and not remain trapped in grief.",
    source: "Bhagavad Gita 18.66",
    sourceUrl: "https://www.gitasupersite.iitk.ac.in/srimad?field_chapter_value=18&field_nsutra_value=66&language=dv",
  },
];
