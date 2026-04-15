export type ParsedEmailContact = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
};

const FREE_EMAIL_PROVIDERS = new Set([
  "gmail", "yahoo", "hotmail", "outlook", "aol", "icloud", "mail",
  "protonmail", "zoho", "yandex", "gmx", "web", "t-online", "freenet",
  "live", "msn", "comcast", "verizon", "att", "sbcglobal", "me",
]);

const TLD_TO_COUNTRY: Record<string, string> = {
  us: "United States", uk: "United Kingdom", gb: "United Kingdom",
  de: "Germany", fr: "France", it: "Italy", es: "Spain",
  nl: "Netherlands", be: "Belgium", ch: "Switzerland", at: "Austria",
  se: "Sweden", no: "Norway", dk: "Denmark", fi: "Finland",
  pt: "Portugal", ie: "Ireland", pl: "Poland", cz: "Czech Republic",
  hu: "Hungary", ro: "Romania", bg: "Bulgaria", gr: "Greece",
  hr: "Croatia", sk: "Slovakia", si: "Slovenia", lt: "Lithuania",
  lv: "Latvia", ee: "Estonia", lu: "Luxembourg", mt: "Malta",
  cy: "Cyprus", is: "Iceland", li: "Liechtenstein", mc: "Monaco",
  va: "Vatican", sm: "San Marino", ad: "Andorra",
  jp: "Japan", kr: "South Korea", cn: "China", tw: "Taiwan",
  hk: "Hong Kong", sg: "Singapore", in: "India", au: "Australia",
  nz: "New Zealand", br: "Brazil", mx: "Mexico", ar: "Argentina",
  cl: "Chile", co: "Colombia", pe: "Peru", za: "South Africa",
  ng: "Nigeria", eg: "Egypt", il: "Israel", ae: "UAE",
  sa: "Saudi Arabia", qa: "Qatar", kw: "Kuwait", bh: "Bahrain",
  tr: "Turkey", th: "Thailand", vn: "Vietnam", my: "Malaysia",
  id: "Indonesia", ph: "Philippines", pk: "Pakistan", bd: "Bangladesh",
  ru: "Russia", ua: "Ukraine", by: "Belarus", kz: "Kazakhstan",
  ca: "Canada",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function deriveName(localPart: string): { firstName: string; lastName: string } {
  const separators = /[._\-]/;
  const parts = localPart.split(separators).filter(Boolean);

  if (parts.length >= 2) {
    return {
      firstName: capitalize(parts[0]),
      lastName: parts.slice(1).map(capitalize).join(" "),
    };
  }

  // Try camelCase split: "johnSmith" → ["john", "Smith"]
  const camelParts = localPart.match(/[A-Z]?[a-z]+/g);
  if (camelParts && camelParts.length >= 2) {
    return {
      firstName: capitalize(camelParts[0]),
      lastName: camelParts.slice(1).map(capitalize).join(" "),
    };
  }

  // Single word — use as firstName, leave lastName empty
  return { firstName: capitalize(localPart), lastName: "" };
}

function deriveCompany(domain: string): string {
  const parts = domain.split(".");
  // Remove TLD and common subdomains
  const mainPart = parts[0] === "www" ? parts[1] : parts[0];
  if (!mainPart) return "";
  if (FREE_EMAIL_PROVIDERS.has(mainPart.toLowerCase())) return "";
  // Capitalize company name, handle hyphens
  return mainPart.split("-").map(capitalize).join("-");
}

function deriveCountry(domain: string): string {
  const tld = domain.split(".").pop()?.toLowerCase() ?? "";
  // Handle co.uk, com.au, co.jp, etc.
  const secondLevel = domain.split(".").slice(-2).join(".");
  const specialMappings: Record<string, string> = {
    "co.uk": "United Kingdom", "co.jp": "Japan", "co.kr": "South Korea",
    "co.in": "India", "co.za": "South Africa", "co.nz": "New Zealand",
    "co.il": "Israel", "com.au": "Australia", "com.br": "Brazil",
    "com.mx": "Mexico", "com.ar": "Argentina", "com.sg": "Singapore",
    "com.hk": "Hong Kong", "com.my": "Malaysia", "com.tr": "Turkey",
    "com.pe": "Peru", "com.co": "Colombia", "com.ph": "Philippines",
    "org.uk": "United Kingdom", "ac.uk": "United Kingdom",
    "ac.nz": "New Zealand", "ac.za": "South Africa",
    "ac.in": "India", "edu.au": "Australia",
  };
  if (specialMappings[secondLevel]) return specialMappings[secondLevel];
  return TLD_TO_COUNTRY[tld] ?? "";
}

export function parseEmails(text: string): ParsedEmailContact[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  if (!matches) return [];

  const seen = new Set<string>();
  const contacts: ParsedEmailContact[] = [];

  for (const email of matches) {
    const lower = email.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    const [localPart, domain] = email.split("@");
    const { firstName, lastName } = deriveName(localPart);
    const company = deriveCompany(domain);
    const country = deriveCountry(domain);

    contacts.push({ email: lower, firstName, lastName, company, country });
  }

  return contacts;
}
