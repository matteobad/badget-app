const commonWords = new Set([
  "the",
  "and",
  "or",
  "but",
  "if",
  "when",
  "where",
  "how",
  "why",
  "a",
  "an",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "of",
  "to",
  "from",
  "over",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
]);

export const tokenize = (description: string) => {
  return (
    description
      // 1. Separare snake_case e camelCase
      .replace(/([a-z])([A-Z])/g, "$1 $2") // gestisce camelCase
      .replace(/_/g, " ") // gestisce snake_case
      // 2. Separare tutti i caratteri non alfabetici e numerici
      .split(/[^a-zA-Z]+/)
      // 3. Convertire in minuscolo e filtrare parole comuni e numeri
      .map((token) => token.toLowerCase())
      .filter((token) => token.length > 0 && !commonWords.has(token))
  );
};
