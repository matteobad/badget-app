import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";

import { type schema } from "..";

const __dirname = dirname(fileURLToPath(import.meta.url));

type PensionFundRecord = Pick<
  typeof schema.pensionFunds.$inferInsert,
  "name" | "type" | "registrationNumber"
>;

const processFile = async () => {
  const records: PensionFundRecord[] = [];
  const parser = fs
    .createReadStream(`${__dirname}/20240822-pension_fund_list.csv`)
    .pipe(parse());

  for await (const record of parser) {
    records.push(record as PensionFundRecord);
  }

  return records;
};

export const pensionFundsMock = await processFile();
