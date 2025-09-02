You are working on a personal finance web app built with:

- Next.js (App Router)
- TypeScript
- Drizzle ORM with Postgres
- tRPC for APIs
- TanStack Query on frontend
- better-auth for authentication
- UI: ShadCN + Tailwind

The app already has support for:

- Accounts
- Transactions (imported from APIs or manually created)
- Categories

Currently, a transaction can only belong to one category, but users requested the ability to split a single transaction into multiple parts, each with its own category and amount.

We want to implement transaction splits while keeping the original imported transaction immutable. The split data will live in a separate table.

## 🎯 Feature requirements

### Data model

Extend the DB schema with a new table transaction_splits_table:

| Column         | Type      | Constraints Description                          |
| -------------- | --------- | ------------------------------------------------ |
| id             | uuid      | Primary key                                      |
| transaction_id | uuid      | Foreign key → transactions.id, on delete cascade |
| category_id    | uuid      | Foreign key → categories.id                      |
| amount         | numeric   | Must be > 0                                      |
| note           | text      | Nullable                                         |
| created_at     | timestamp |                                                  |
| updated_at     | timestamp |                                                  |

Rule: the sum of splits must equal the transaction amount.

- If a transaction has splits → ignore its category_id in reports and only use the splits.
- If no splits → fallback to transactions.category_id.

## Backend (tRPC)

Add procedures under transactions router:

- addSplit(transactionId, splits[])
- updateSplit(splitId, data)
- deleteSplit(splitId)
- getSplits(transactionId)

Enforce validation (e.g., Zod) so splits always sum to the transaction amount.

## Frontend

On the transaction detail page (or wherever appropriate):

1. Show a “Split transaction”.
   - If splits don't exists:
     - Show a new element inside the actions dropdown of the transactions table.
     - New splits are created inside a modal
   - If splits exist:
     - Show multiple category badges of the transaction row
     - Show small split icon close to the import with tooltip info of the split
   - Creating a new split or clicking on the split info icon will open a modal:
     - Render them in a small editable list: amount, category selector, optional note.
     - Provide “Add row” and “Delete row” actions.
     - Show a live sum and validate against transaction total.

- If user tries to save and the amounts don’t match → show error.
- Use TanStack Query hooks to call tRPC mutations and refresh state.

## Reporting

Don't touch this since it's handled via postgres functions and not in the codebase

## Migration

I'll create the migration with drizzle afterwards.

## 🚧 Additional notes

- Current transaction table definition:

  ```ts
  export const transaction_table = pgTable(
    "transaction_table",
    (d) => ({
      id: d.uuid().defaultRandom().primaryKey().notNull(),

      // FK
      organizationId: d
        .uuid()
        .references(() => organization_table.id, { onDelete: "cascade" })
        .notNull(),
      accountId: d
        .uuid()
        .notNull()
        .references(() => account_table.id, { onDelete: "cascade" }),

      // Base properties
      amount: numericCasted({ precision: 10, scale: 2 }).notNull(),
      currency: d.char({ length: 3 }).notNull(),
      date: d.date().notNull(),
      name: d.text().notNull(),
      description: d.text(),
      internal: d.boolean().default(false),
      method: transactionMethodEnum().notNull(),
      status: transactionStatusEnum().default("posted").notNull(),
      note: d.text(),

      // Enrichement fields
      categoryId: d.uuid().references(() => category_table.id),
      categorySlug: d.text(),
      counterpartyName: d.text(),
      recurring: d.boolean().notNull().default(false),
      frequency: transactionFrequencyEnum(),
      transferId: d.uuid(), // For double-entry transfers between accounts
      merchantName: d.text(),
      enrichmentCompleted: d.boolean().default(false),

      // Metadata for internal use
      externalId: d.text(), // External ID from API or CSV
      fingerprint: d.text().notNull(), // Hash for deduplication
      notified: d.boolean().default(false), // For notification to the user
      source: transactionSourceEnum().notNull().default("manual"), // Source of the transaction
      ftsVector: tsvector("fts_vector")
        .notNull()
        .generatedAlwaysAs(
          (): SQL => sql`
                  to_tsvector(
                      'english',
                      (
                          (COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text)
                      )
                  )
              `,
        ),

      ...timestamps,
    }),
    (t) => [
      index("idx_transactions_date").using("btree", t.date.asc().nullsLast()),
      index("idx_transactions_organization_id_date_name").using(
        "btree",
        t.organizationId.asc().nullsLast(),
        t.date.asc().nullsLast(),
        t.name.asc().nullsLast(),
      ),
      index("idx_transactions_organization_id_name").using(
        "btree",
        t.organizationId.asc().nullsLast(),
        t.name.asc().nullsLast(),
      ),
      index("transactions_bank_account_id_idx").using(
        "btree",
        t.accountId.asc().nullsLast(),
      ),
      index("transactions_category_slug_idx").using(
        "btree",
        t.categorySlug.asc().nullsLast(),
      ),
      index("transactions_organization_id_idx").using(
        "btree",
        t.organizationId.asc().nullsLast(),
      ),
      index("transactions_fingerprint_idx").using(
        "btree",
        t.accountId.asc().nullsLast(),
        t.fingerprint.asc().nullsLast(),
      ),
      index("transactions_transfer_id_idx").using(
        "btree",
        t.transferId.asc().nullsLast(),
      ),
      index("idx_transactions_fts").using(
        "gin",
        t.ftsVector.asc().nullsLast().op("tsvector_ops"),
      ),
      index("idx_transactions_fts_vector").using(
        "gin",
        t.ftsVector.asc().nullsLast().op("tsvector_ops"),
      ),
      unique().on(t.organizationId, t.externalId),
    ],
  );
  ```

- Category table definition:

  ```ts
  export const category_table = pgTable(
    "category_table",
    (d) => ({
      id: d.uuid().primaryKey().defaultRandom(),

      // FK
      organizationId: d
        .uuid()
        .references(() => organization_table.id, { onDelete: "cascade" })
        .notNull(),
      parentId: d.uuid().references((): AnyPgColumn => category_table.id, {
        onDelete: "set null",
      }),

      type: categoryTypeEnum().notNull(),
      name: d.varchar({ length: 64 }).notNull(),
      slug: d.varchar({ length: 64 }).notNull(),
      color: d.varchar({ length: 32 }),
      icon: d.varchar({ length: 32 }),
      description: d.text(),
      excludeFromAnalytics: d.boolean().default(false),

      ...timestamps,
    }),
    (t) => [unique("unique_organization_slug").on(t.slug, t.organizationId)],
  );
  ```

- Transaction table component:

  `src/components/transaction/table/**/*.tsx`

- State management:

only TanStack Query or query parameters with nuqs

## ✅ Deliverables

- Drizzle schema update
- tRPC procedures + validation
- React UI components for split editor (integrated into transaction detail page)

> 👉 Make sure the implementation is production-ready, type-safe, and consistent with the existing architecture.
