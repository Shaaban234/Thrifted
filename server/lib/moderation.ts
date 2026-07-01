// Chat content guard (server copy). Enforced in POST /conversations/:id/messages
// as the authoritative check — the client guard (lib/moderation.ts) is for UX.
//
// NOTE: keep this file in sync with the app's lib/moderation.ts. Both are pure
// and dependency-free; duplicated because the app and server build separately.

export type GuardReason = "phone" | "link" | "email" | "file" | "payment" | "profanity";

export interface GuardResult {
  ok: boolean;
  reason?: GuardReason;
  message?: string;
}

const MESSAGES: Record<GuardReason, string> = {
  phone: "Phone numbers can't be shared in chat. Keep deals on NayaPurana for Buyer Protection.",
  link: "Links can't be shared in chat.",
  email: "Email addresses can't be shared in chat.",
  file: "Files can't be shared in chat.",
  payment: "Never share bank, card or wallet details (JazzCash, EasyPaisa, etc.). Pay securely through NayaPurana.",
  profanity: "Let's keep it respectful — please remove any offensive language.",
};

const PAYMENT_PATTERNS: RegExp[] = [
  /\bjazz\s*cash\b/i,
  /\beasy\s*paisa\b/i,
  /\bsada\s*pay\b/i,
  /\bnaya\s*pay\b/i,
  /\bu\s*paisa\b/i,
  /\bkonnect\b/i,
  /\b(iban|swift)\b/i,
  /\bbank\s*account\b/i,
  /\b(bank|card|account|acc)\s*(no\.?|number|details?)\b/i,
  /\b(cvv|atm\s*card|debit\s*card|credit\s*card)\b/i,
];

const PROFANITY = [
  // English
  "fuck", "fuk", "fuckin", "fucking", "motherfucker", "shit", "bullshit",
  "bitch", "asshole", "arsehole", "bastard", "dick", "piss", "cunt", "slut",
  "whore", "douche", "faggot", "nigger", "nigga", "retard",
  // Roman Urdu
  "gandu", "gaandu", "gandoo", "gand", "chutiya", "chutiye", "chutya", "chootiya",
  "harami", "haramzada", "haramkhor", "kanjar", "kanjri", "kutta", "kutti", "kutte",
  "kamina", "kaminay", "kamini", "lund", "lauda", "loda", "lawda", "phudi", "phuddi",
  "choot", "chut", "chod", "chodu", "chudai", "randi", "rundi", "tatti", "gashti",
  "gasti", "jhant", "jhaant", "chinaal", "chinal",
];

const ABUSE_PATTERNS: RegExp[] = [
  /\bbhen?\s*chod/i,
  /\bbehan\s*chod/i,
  /\bmadar\s*chod/i,
  /\bbhosdi?\s*(ke|ka|walay?)?\b/i,
  /\bharami?\s*zada/i,
];

function blocked(reason: GuardReason): GuardResult {
  return { ok: false, reason, message: MESSAGES[reason] };
}

export function checkMessage(raw: string): GuardResult {
  const text = raw ?? "";

  if (/(https?:\/\/|www\.)/i.test(text)) return blocked("link");
  if (/\b[a-z0-9-]+\.(com|net|org|io|co|me|pk|info|biz|xyz|link|app|shop|store|online|site|gg|ly|to|be)(\/\S*)?\b/i.test(text))
    return blocked("link");

  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return blocked("email");

  if (PAYMENT_PATTERNS.some((re) => re.test(text))) return blocked("payment");

  if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|apk|exe|dmg|jpe?g|png|gif|webp|mp4|mov|mkv|mp3|wav|csv|txt)\b/i.test(text))
    return blocked("file");

  const runs = text.match(/\+?\d[\d\s().-]{7,}\d/g);
  if (runs && runs.some((r) => r.replace(/\D/g, "").length >= 9)) return blocked("phone");

  const lower = text.toLowerCase();
  if (PROFANITY.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) return blocked("profanity");
  if (ABUSE_PATTERNS.some((re) => re.test(text))) return blocked("profanity");

  return { ok: true };
}
