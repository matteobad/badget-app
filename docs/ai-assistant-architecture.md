# AI Assistant Architecture for Badget

**Versione:** 1.0  
**Data:** 2025-10-07  
**Autore:** Badget AI Architecture (bozza operativa)

## Obiettivo

Costruire un AI-layer modulare, affidabile e osservabile sopra i dati di Badget (Next.js + tRPC + Drizzle + Postgres + Clerk) che:

- Risponda a query naturali dell'utente;
- Orchestri chiamate a tool deterministici (READ/WRITE);
- Streammi testo + artefatti (table/chart/KPI) al client;
- Eviti che l'LLM inventi numeri (numeri derivano sempre dai tool);
- Implementi `preview → confirm` per tutte le scritture.

---

## Principi architetturali

1. **Router (intent)**: singola chiamata LLM leggera con prompt ridotto che decide i domini (sub-agents) da invocare.
2. **Sub-agents (domini)**: responsabili di un perimetro limitato; ogni agente espone 3–7 tool statici.
3. **Tool contract**: Zod per input/output. Ogni tool ha `name`, `version`, `deterministicReads` flag.
4. **Cache deterministica**: Redis con chiavi `sha256(toolName:version:orgId:role:stableParams)`.
5. **Provenance**: ogni artifact contiene meta provenance (tool, version, fetchedAt).
6. **Preview/Confirm**: tutte le scritture producono preview (diff + id) e richiedono conferma client-side.
7. **Numbers from tools**: il server sostituisce e verifica ogni numero mostrato dal LLM con quello derivato dal tool.

---

## Dominî definitivi (MVP)

- `accounts` — stato conti, saldi, istituti
- `transactions` — movimenti, FTS, filtri
- `reports` — aggregati: cashflow, net worth, breakdown (unico dominio per aggregazioni)
- `insights` (opzionale) — anomalie, suggerimenti AI
- `integrations` (opzionale tech) — sync provider, stato connessioni
- `system` — viste, preferenze

> Nota: `budgets` e `goals` rimandati a future iterazioni (non implementati ora).

---

## Tool catalog (esempi per dominio)

> Ogni tool è descritto con tipo (READ/WRITE), se è cacheable e scopo.

### accounts

- `getAccounts` — READ — ✅ cache — elenco conti + saldi
- `getAccountBalanceHistory` — READ — ✅ cache — serie storica giornaliera
- `linkAccountPreview` / `confirmLinkAccount` — WRITE — ❌ — preview + confirm
- `getInstitutions` — READ — ✅ cache

### transactions

- `getTransactions` — READ — ✅ cache — unifica search + filtri (FTS)
- `getTransactionSummary` — READ — ✅ cache — totali per periodo
- `categorizeTransactionsPreview` / `confirmCategorizeTransactions` — WRITE — ❌ — batch categorize
- `importTransactionsPreview` / `confirmImportTransactions` — WRITE — ❌

### reports

- `getCashflow` — READ — ✅ cache — entrate/uscite per periodo
- `getNetWorth` — READ — ✅ cache — patrimonio netto aggregato
- `getSpendingTrends` — READ — ✅ cache — trend mensile/settimanale
- `generateReport` — READ — ✅ cache — composizione multi-dominio

### insights (opzionale)

- `getAnomalies` — READ — ✅ cache
- `getSuggestions` — READ — ✅ cache

---

## Contract pattern (Zod)

Tutti i tool usano Zod per input/output. Esempio (semplificato):

```ts
import { z } from "zod";

export const GetTransactionsInput = z.object({
  orgId: z.string(),
  viewId: z.string().optional(),
  query: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  currency: z.string(),
  accountId: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
});

export const GetTransactionsOutput = z.object({
  transactions: z.array(TransactionSchema),
  fetchedAt: z.string(),
  meta: z.object({ total: z.number().optional() }).optional(),
});
```
