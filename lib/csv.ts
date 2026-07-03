const HEADER_PATTERNS = /^(url|email|link|credit|links|emails)$/i;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseSingleColumnCsv(content: string): string[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstValues = parseCsvLine(lines[0]);
  const firstCell = firstValues[0] ?? "";

  const startIndex =
    lines.length > 1 && HEADER_PATTERNS.test(firstCell) ? 1 : 0;

  const results: string[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const value = (values[0] ?? "").trim();
    if (value) results.push(value);
  }

  return results;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
