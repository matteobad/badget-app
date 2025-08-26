# Transaction Import & Balance Management

Questo modulo gestisce in modo coerente transazioni, saldi e snapshot giornalieri
per conti **manuali** e **connessi via API**, inclusa l’importazione da file CSV.

---

## 🏦 Tipi di Conto

- **Conti connessi (API)**
  - Dati giornalieri provenienti dal provider bancario.
  - Le transazioni non possono essere inserite manualmente.
  - Consentito import CSV **solo per backfill** (date precedenti alla `authoritative_from` del provider).
  - Saldi calcolati devono combaciare con gli snapshot ufficiali del provider.

- **Conti manuali**
  - Richiedono un saldo iniziale al momento della creazione (t0).
  - Transazioni **dopo t0** aggiornano i saldi in avanti.
  - Transazioni **prima di t0** aggiornano un “balance offset”.
  - Consentito import CSV con date miste (prima e dopo t0).

---

## 📥 Flussi di Ingresso Transazioni

1. **Sync via API** (solo conti connessi)
2. **Creazione manuale** (solo conti manuali)
3. **Import da CSV** (entrambi i tipi, con regole dedicate)

---

## 📂 Pipeline di Import da CSV

1. **Parse CSV**
   - Validazione sintattica dei campi (date, amount, required).
2. **Get Account Details**
   - Recupero configurazione account (tipo, t0, authoritative_from).
3. **Deduplicate**
   - Eliminazione duplicati intra-file e rispetto al DB (basato su `external_id`, hash o criteri compositi).
4. **Validate**
   - Applicazione regole di business (manual vs connected).
5. **Insert Valid Transactions**
   - Batch insert con rollback su errore.
6. **Calculate Affected Date Range**
   - Min/max date delle transazioni accettate.
7. **Recalculate Snapshots**
   - Rigenerazione snapshot solo sull’intervallo interessato.
   - Per conti manuali: gestione offset.
   - Per conti connessi: riconciliazione con snapshot API.
8. **Record Import**
   - Salvataggio log/report con conteggi: inserted / duplicate / invalid / rejected.

---

## 📊 Snapshots

- Ogni giorno è rappresentato da un saldo coerente.
- **Manual accounts**:
  ```
  snapshot = opening_balance + offset + sum(transactions fino a quel giorno)
  ```
- **Connected accounts**:
  ```
  snapshot = API_snapshot` (se disponibile)
  altrimenti `opening_balance + sum(transactions fino a quel giorno)
  ```

---

## 🔄 Background Jobs

- **sync-account**
  - upsert-transactions
  - recalculate-snapshots

- **import-csv**
  - upsert-transactions
  - recalculate-snapshots

- **manual CRUD**
  - operazioni sincrone: aggiornano subito snapshots e offsets

---

## ✅ Test Coverage

Vedi `tests/import-csv.test.ts` con i seguenti gruppi:

- Parsing & Validation
- Deduplication
- Business rules (manual vs connected)
- Snapshots
- Offsets
- CRUD manual transactions
- Import pipeline end-to-end

---

## 📌 Note

- I saldi devono essere sempre ricalcolabili a partire da opening balance + offset + transazioni.
- Gli snapshot API prevalgono su quelli calcolati.
- Ogni import deve essere **idempotente**: re-import dello stesso file non deve creare duplicati.
