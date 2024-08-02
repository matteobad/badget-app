"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import {
  type investmentBranchesSelect,
  type PensionFundsSelect,
} from "~/server/db";
import { CreatePensionAccountForm } from "./create-pension-account";
import { Done } from "./done";
import Intro from "./intro";

export function AddSavingAccountFlow(props: {
  pensionFundsPromise: Promise<
    (PensionFundsSelect & {
      investmentsBranches: investmentBranchesSelect[];
    })[]
  >;
}) {
  const search = useSearchParams();
  const step = search.get("step");

  return (
    <div className="flex w-full flex-col items-center">
      <AnimatePresence mode="wait">
        {!step && <Intro key="intro" />}
        {/* {step === "create-emergency" && <CreateEmergencyAccount />} */}
        {step === "create-pension" && (
          <CreatePensionAccountForm
            pensionFundsPromise={props.pensionFundsPromise}
          />
        )}
        {step === "done" && <Done />}
      </AnimatePresence>
    </div>
  );
}
