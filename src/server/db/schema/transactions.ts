import { createId } from "@paralleldrive/cuid2";
import {
  char,
  integer,
  numeric,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { category_table } from "./categories";

export const transaction_table = pgTable(
  "transaction_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    userId: varchar({ length: 32 }).notNull(),
    accountId: varchar({ length: 128 })
      .notNull()
      .references(() => account_table.id),
    categoryId: varchar({ length: 128 }).references(() => category_table.id),

    rawId: text().unique(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: char({ length: 3 }).notNull(),
    date: timestamp({ withTimezone: true }).notNull(),
    description: text().notNull(),
    note: text(),

    ...timestamps,
  },
  (t) => [unique().on(t.userId, t.rawId)],
);

export type DB_TransactionType = typeof transaction_table.$inferSelect;
export type DB_TransactionInsertType = typeof transaction_table.$inferInsert;

export const attachment_table = pgTable("attachment_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  userId: varchar({ length: 32 }).notNull(),
  transactionId: varchar({ length: 128 }).references(
    () => transaction_table.id,
    { onDelete: "cascade" },
  ),

  fileName: text().notNull(),
  fileKey: text().notNull(), // Chiave del file in UploadThing (equivalente a file_name su S3)
  fileUrl: text().notNull(), // URL pubblico o presigned
  fileType: text().notNull(), // MIME type
  fileSize: integer().notNull(), // number

  ...timestamps,
});

export type DB_AttachmentType = typeof attachment_table.$inferSelect;
export type DB_AttachmentInsertType = typeof attachment_table.$inferInsert;

// Tags Table (for multi-label categorization)
export const tag_table = pgTable(
  "tag_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    userId: varchar({ length: 32 }).notNull(),
    name: text().notNull(),

    ...timestamps,
  },
  (t) => [unique().on(t.userId, t.name)],
);

export type DB_TagType = typeof tag_table.$inferSelect;
export type DB_TagInsertType = typeof tag_table.$inferInsert;

// Many-to-Many Relationship: Transactions ↔ Tags
export const transaction_to_tag_table = pgTable(
  "transaction_to_tag_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    transactionId: varchar({ length: 128 }).references(
      () => transaction_table.id,
      { onDelete: "cascade" },
    ),
    tagId: varchar({ length: 128 }).references(() => tag_table.id, {
      onDelete: "cascade",
    }),

    ...timestamps,
  },
  (t) => [unique().on(t.transactionId, t.tagId)],
);
