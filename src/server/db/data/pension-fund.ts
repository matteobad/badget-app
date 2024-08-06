import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";
import { endOfYear, subYears } from "date-fns";

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

type PensionFundWithBranchesAndPerformances = PensionFund & {
  investmentBranches: (typeof schema.investmentBranches.$inferInsert & {
    performances: (typeof schema.investmentBranchesPerf.$inferInsert)[];
  })[];
};

const processFile = async () => {
  const records = new Map<string, PensionFundWithBranchesAndPerformances>();
  const parser = fs
    .createReadStream(`${__dirname}/31122023-pension_funds.csv`)
    .pipe(parse({ from_line: 2, relax_quotes: true, delimiter: ";" }));

  for await (const record of parser) {
    const [
      id,
      type,
      company,
      name,
      branch,
      _note,
      category,
      isc2,
      isc5,
      isc10,
      isc35,
      _col2,
      yield3,
      yield5,
      yield1,
      _note2,
      yield10,
      yield20,
    ] = record as string[];

    if (!name || !id) continue;

    const pensionfund: PensionFundWithBranchesAndPerformances = records.get(
      id,
    ) ?? {
      type: mapPensionFundType(type),
      name,
      registrationNumber: parseInt(id, 10),
      investmentBranches: [],
    };

    pensionfund.investmentBranches.push({
      category: mapInvestmentBranchCategory(category),
      description: branch,
      isc2: parseFloat(isc2?.replace(",", ".") ?? "0"),
      isc5: parseFloat(isc5?.replace(",", ".") ?? "0"),
      isc10: parseFloat(isc10?.replace(",", ".") ?? "0"),
      isc35: parseFloat(isc35?.replace(",", ".") ?? "0"),
      performances: [
        {
          date: endOfYear(subYears(new Date(), 1)),
          yield1: parseFloat(yield1?.replace(",", ".") ?? "0"),
          yield3: parseFloat(yield3?.replace(",", ".") ?? "0"),
          yield5: parseFloat(yield5?.replace(",", ".") ?? "0"),
          yield10: parseFloat(yield10?.replace(",", ".") ?? "0"),
          yield20: parseFloat(yield20?.replace(",", ".") ?? "0"),
          branchId: -1,
        },
      ],
    });

    records.set(id, pensionfund);
  }

  return records;
};

export const pensionFundsMock = await processFile();
