import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";

import { type schema } from "..";
import { BranchCategory, PensionFundType } from "../schema/pension-funds";

const __dirname = dirname(fileURLToPath(import.meta.url));

function mapPensionFundType(type?: string) {
  return (Object.entries(PensionFundType).find(([_, value]) => {
    return value === type;
  })?.[0] ?? PensionFundType.UNKNOWN) as PensionFundType;
}

function mapInvestmentBranchCategory(type?: string) {
  return (Object.entries(BranchCategory).find(([_, value]) => {
    return value === type;
  })?.[0] ?? BranchCategory.UNKNOWN) as BranchCategory;
}

type PensionFund = Pick<
  typeof schema.pensionFunds.$inferInsert,
  "name" | "type" | "registrationNumber"
>;

type PensionFundWithBranches = PensionFund & {
  investmentBranches: (typeof schema.investmentBranches.$inferInsert)[];
};

const processFile = async () => {
  const records = new Map<string, PensionFundWithBranches>();
  const parser = fs
    .createReadStream(`${__dirname}/31072024-COVIP-pension_funds_with_isc.csv`)
    .pipe(parse({ from_line: 2, relax_quotes: true, delimiter: ";" }));

  for await (const record of parser) {
    const [
      registrationNumber,
      type,
      _company,
      name,
      branchDescription,
      _note,
      branchCategory,
      isc2,
      isc5,
      isc10,
      isc35,
    ] = record as string[];

    if (!name || !registrationNumber) continue;

    const pensionfund: PensionFundWithBranches = records.get(
      registrationNumber,
    ) ?? {
      type: mapPensionFundType(type),
      name,
      registrationNumber: parseInt(registrationNumber, 10),
      investmentBranches: [],
    };

    pensionfund.investmentBranches.push({
      category: mapInvestmentBranchCategory(branchCategory),
      description: branchDescription,
      isc2: parseFloat(isc2?.replace(",", ".") ?? "0"),
      isc5: parseFloat(isc5?.replace(",", ".") ?? "0"),
      isc10: parseFloat(isc10?.replace(",", ".") ?? "0"),
      isc35: parseFloat(isc35?.replace(",", ".") ?? "0"),
    });

    records.set(registrationNumber, pensionfund);
  }

  return records;
};

export const pensionFundsMock = await processFile();
