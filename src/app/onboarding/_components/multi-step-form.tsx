"use client";

import { AnimatePresence } from "framer-motion";
import { useQueryStates } from "nuqs";

import { onboardingParsers } from "../_utils/onboarding-search-params";
import { CreateProject } from "./create-project";
import { Done } from "./done";
import Intro from "./intro";

export function Onboarding() {
  const [{ step, orgId }] = useQueryStates(onboardingParsers);

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] w-full max-w-screen-sm flex-col items-center">
      <AnimatePresence mode="wait">
        {!step && <Intro key="intro" />}
        {step === "create-project" && <CreateProject />}
        {step === "done" && <Done workspaceId={orgId} />}
      </AnimatePresence>
    </div>
  );
}
