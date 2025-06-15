import type { DB_RuleType, DB_TokenType } from "~/server/db/schema/categories";
import { LRUCache } from "next/dist/server/lib/lru-cache";
import { db } from "~/server/db";
import { rule_table, token_table } from "~/server/db/schema/categories";
import { type DB_TransactionType } from "~/server/db/schema/transactions";
import { and, desc, eq, inArray } from "drizzle-orm";
import { eng, ita, removeStopwords } from "stopword";

// Tipi per le transazioni e le categorie
type Transaction = Partial<DB_TransactionType> & { description: string };

type RuleWithTokens = DB_RuleType & { tokens: DB_TokenType[] };

// Caches
const tokenCache = new LRUCache<string[]>(500);
const ruleCache = new LRUCache<RuleWithTokens[]>(100);

// Funzione per estrarre, normalizzare e tokenizzare i dati da una descrizione
const extractTokens = (description: string): string[] => {
  // Verifica se la descrizione è già in cache
  if (tokenCache.has(description)) {
    return tokenCache.get(description)!;
  }

  // Normalizza: minuscolo e rimozione di caratteri speciali
  const normalized = description.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  // Split in parole e filtra parole troppo corte
  let tokens = normalized.split(/\s+/).filter((word) => word.length > 2);

  // Rimozione delle stopwords
  tokens = removeStopwords(tokens, [...ita, ...eng]);

  // Applica lo stemming per ridurre le parole alla radice
  // TODO: fix dependencies
  // tokens = tokens.map((token) => PorterStemmer.stem(token));

  // Genera bigrammi per catturare contesti di due parole
  const bigrams = tokens
    .slice(0, -1)
    .map((_, i) => `${tokens[i]}_${tokens[i + 1]}`);

  // Unisci token e bigrammi, rimuovendo eventuali duplicati
  const allTokens = Array.from(new Set([...tokens, ...bigrams]));

  // Salva nella cache
  tokenCache.set(description, allTokens);

  return allTokens;
};

// Fetch rules with caching
const fetchRulesFromDB = async (userId: string): Promise<RuleWithTokens[]> => {
  if (ruleCache.has(userId)) return ruleCache.get(userId)!;

  const rules = await db
    .select()
    .from(rule_table)
    .where(eq(rule_table.userId, userId));
  if (!rules.length) return [];

  const ruleIds = rules.map((r) => r.id);
  const tokens = await db
    .select()
    .from(token_table)
    .where(inArray(token_table.ruleId, ruleIds))
    .orderBy(desc(token_table.relevance));

  // Map tokens to rules
  const rulesWithTokens = rules.map((rule) => ({
    ...rule,
    tokens: tokens.filter((t) => t.ruleId === rule.id),
  }));

  ruleCache.set(userId, rulesWithTokens);
  return rulesWithTokens;
};

// Funzione per creare o aggiornare una regola basata su una categorizzazione manuale
export const updateOrCreateRule = async (
  userId: string,
  description: string,
  categoryId?: string | null,
) => {
  if (!categoryId) return;

  // Controlla se esiste già una regola per la categoria specificata
  let rule = await db
    .select({ id: rule_table.id })
    .from(rule_table)
    .where(
      and(eq(rule_table.userId, userId), eq(rule_table.categoryId, categoryId)),
    )
    .then((res) => res[0]);

  if (!rule) {
    // Crea una nuova regola se non esiste
    [rule] = await db
      .insert(rule_table)
      .values({ userId, categoryId })
      .returning({ id: rule_table.id });
  }

  // Estrai i token dalla descrizione
  const tokens = extractTokens(description);

  for (const token of tokens) {
    // Verifica se il token esiste già per la regola
    const existingToken = await db
      .select({ id: token_table.id, relevance: token_table.relevance })
      .from(token_table)
      .where(
        and(eq(token_table.ruleId, rule!.id), eq(token_table.token, token)),
      )
      .then((res) => res[0]);

    if (existingToken) {
      // Incrementa la rilevanza se il token esiste già
      await db
        .update(token_table)
        .set({ relevance: existingToken.relevance + 1 })
        .where(eq(token_table.id, existingToken.id));
    } else {
      // Crea un nuovo token con rilevanza iniziale
      await db
        .insert(token_table)
        .values({ ruleId: rule!.id, token, relevance: 1 });
    }
  }
};

// Categorize transaction
export const categorizeTransaction = async (
  userId: string,
  transaction: Transaction,
): Promise<string | null> => {
  const rules = await fetchRulesFromDB(userId);
  const tokens = new Set(extractTokens(transaction.description));

  let bestMatch: { categoryId: string; relevance: number } | null = null;

  for (const rule of rules) {
    for (const token of rule.tokens) {
      if (
        tokens.has(token.token) &&
        (!bestMatch || token.relevance > bestMatch.relevance)
      ) {
        bestMatch = { categoryId: rule.categoryId, relevance: token.relevance };
      }
    }
  }

  return bestMatch?.categoryId ?? null;
};

// Batch categorize transactions
export const categorizeTransactions = async (
  userId: string,
  transactions: Transaction[],
) => {
  return Promise.all(
    transactions.map(async (tx) => ({
      ...tx,
      categoryId: await categorizeTransaction(userId, tx),
    })),
  );
};
