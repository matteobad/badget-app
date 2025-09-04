# 📖 Gestione delle transazioni splittate

## Contesto

Gli utenti possono avere transazioni che in realtà appartengono a più categorie (es: colazione + sigarette nello stesso pagamento).  
Per gestire questo caso abbiamo introdotto la tabella `transaction_splits`.

## Modello dati

### `badget_transaction_table`

Contiene tutte le transazioni importate o manuali.

- **Campo `internal`:**
  - `true` → la transazione non deve apparire nei report.
  - Viene settato `true` automaticamente se la transazione ha degli split.
- **Campo `category_id`:** usato solo se la transazione non ha split.

### `transaction_splits`

Ogni riga rappresenta un sotto-importo della transazione.

**Campi principali:**

- `transaction_id` → FK verso transazione originale
- `category_id` → categoria assegnata allo split
- `amount` → importo dello split (somma degli split = importo transazione)
- `note` → opzionale

> Gli split vengono sempre considerati come `internal = false`.

## Regole di business

- **Somma coerente:**  
  La somma degli `amount` degli split deve sempre essere uguale all’`amount` della transazione.

- **Esclusione del parent:**  
  Una volta splittata, la transazione originale viene marcata `internal = true`.  
  Solo gli split entrano nei report.

- **Fallback:**  
  Se una transazione non ha split → entra nei report con la sua categoria.

## Funzione `get_spending`

Unifica i dati in una CTE `normalized_tx` che contiene:

- Tutti gli split (forzati con `internal = false`)
- Tutte le transazioni senza split

**Calcola:**

- `total_spending` = somma di tutte le spese
- `per_category` = spese aggregate per categoria

**Restituisce:**

- Nome categoria, slug, colore, icona
- Importo aggregato
- Percentuale sul totale

## Indici consigliati

Per mantenere buone performance:
