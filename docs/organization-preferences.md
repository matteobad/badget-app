# Feature "Account Groups personalizzabili + Preferences ibrido"

Sei l’assistente allo sviluppo di una webapp Next.js + TypeScript + tRPC + Drizzle ORM + Postgres.
Devi implementare una nuova feature per la pagina degli account: la gestione dei gruppi personalizzabili e la nuova tabella organization_preferences con approccio ibrido.

## Obiettivo

1. Migliorare la UI/UX della pagina Accounts:
   - Mostrare gli account raggruppati non più per subtype, ma per gruppi configurabili dall’organizzazione.
   - Offrire un raggruppamento di default (per obiettivi: Liquidità, Investimenti, Passività breve, Passività lungo).
   - Permettere all’utente (a livello di organizzazione) di:
     - rinominare i gruppi
     - riordinare i gruppi
     - aggiungere/eliminare gruppi
     - spostare account tra gruppi

2. Implementare il nuovo modello di preferences ibride:
   - Preferenze “core” salvate in campi dedicati (base_currency, timezone, locale, week_start_day).
   - Preferenze estendibili in un campo data jsonb (es. account groups).

## Attività richieste

1. Migrazione DB (Drizzle ORM)

   Creare la tabella:

   ```
   organization_preferences (
   id uuid pk,
   organization_id uuid fk -> organizations.id unique,
   base_currency text not null default 'EUR',
   timezone text not null default 'Europe/Rome',
   locale text not null default 'it-IT',
   week_start_day int not null default 1, -- 1=lunedì, 0=domenica
   data jsonb not null default '{}',
   created_at timestamptz default now(),
   updated_at timestamptz default now()
   )
   ```

   In data gestire i gruppi account, con schema tipo:

   ```json
   {
     "account_groups": [
       {
         "id": "liq",
         "name": "Liquidità",
         "order": 1,
         "accounts": ["acc1", "acc2"]
       },
       {
         "id": "inv",
         "name": "Investimenti",
         "order": 2,
         "accounts": ["acc3"]
       }
     ]
   }
   ```

2. API Layer (tRPC)
   - Endpoint per recuperare le preferenze dell’organizzazione.
   - Endpoint per aggiornare le preferenze (PATCH) con validazione (es. zod schema).
     - Endpoint specifici per account_groups:
     - listAccountGroups → restituisce i gruppi con accounts.
     - updateAccountGroups → aggiorna ordine/nome.
     - assignAccountToGroup → sposta un account in un gruppo.

3. Frontend (Next.js + React + ShadCN)
   - UI Account Page:
     - Accordion per ogni gruppo (group.name).
     - Dentro ogni gruppo, tabella degli account come ora.

   - Pulsante "Modifica gruppi" accanto a “+ Aggiungi account”.
     - Attiva modalità editing:
       - rename group (inline edit o modal)
       - drag&drop account → altro gruppo
       - reorder gruppi (drag&drop accordion)
       - aggiungi/elimina gruppo
   - Stato persistito via API → salva in organization_preferences.data.account_groups.

4. Considerazioni UX
   - Se un account non appartiene a nessun gruppo → finisce in “Altri account”.
   - All’inizio popolazione automatica dei gruppi default.
   - Sempre mostrare almeno 1 gruppo (non eliminare tutti).

## Extra

- Inserire validazione lato backend per garantire che un account non appartenga a due gruppi contemporaneamente.

- Prevedere che in futuro alcune preferenze possano diventare per utente invece che per organizzazione → design scalabile.

- Scrivere codice modulare (es. preferencesService.ts) così che altre preferenze future (es. notifiche, layout dashboard) si integrino facilmente.

Path delle cartelle Drizzle (non generare migration la faccio io) `src/server/db/`
Path degli endpoint tRPC: `src/server/api/trpc`
