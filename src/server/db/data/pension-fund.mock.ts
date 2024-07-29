import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";

import { type schema } from "..";
import { PensionFundType } from "../schema/pension-funds";

const __dirname = dirname(fileURLToPath(import.meta.url));

function mapPensionFundType(type: string) {
  return (
    Object.entries(PensionFundType).find(([_, value]) => {
      return value === type;
    })?.[0] ?? PensionFundType.UNKNOWN
  );
}

type PensionFundRecord = Pick<
  typeof schema.pensionFunds.$inferInsert,
  "name" | "type" | "registrationNumber"
>;

const processFile = async () => {
  const records: PensionFundRecord[] = [];
  const parser = fs
    .createReadStream(`${__dirname}/20240822-pension_fund_list.csv`)
    .pipe(parse({ from_line: 2 }));

  for await (const record of parser) {
    const [type, name, registrationNumber] = record as string[];
    if (!type || !name || !registrationNumber) continue;

    records.push({
      type: mapPensionFundType(type),
      name,
      registrationNumber: parseInt(registrationNumber, 10),
    } as PensionFundRecord);
  }

  console.log(records);
  return records;
};

export const pensionFundsMock = await processFile();
