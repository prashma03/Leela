const normalize = (message: string) =>
  message.toLowerCase().trim().replace(/[!.,?]+$/g, "").trim();

export function getShortChatReply(message: string): string | null {
  const clean = normalize(message);

  if (/^(hi|hello|hey|hiya|namaste|good morning|good afternoon|good evening)$/.test(clean)) {
    return clean === "namaste" ? "Namaste!" : "Hello!";
  }

  if (/^(thanks|thank you|thankyou|thx)$/.test(clean)) return "You're welcome!";
  if (/^(ok|okay|alright|got it)$/.test(clean)) return "Okay!";
  if (/^(bye|goodbye|see you|see you later)$/.test(clean)) return "Goodbye!";
  if (/^(how are you|how are you doing)$/.test(clean)) return "I'm doing well. How are you?";

  return null;
}
