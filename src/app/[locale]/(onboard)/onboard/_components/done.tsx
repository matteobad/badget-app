import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQueryStates } from "nuqs";

import { onboardingParsers } from "../_utils/onboarding-search-params";

export function Done() {
  const [{ step, orgId }] = useQueryStates(onboardingParsers);

  const router = useRouter();

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (step === "done") {
      setTimeout(() => {
        startTransition(() => {
          router.push(`${orgId}`);
          router.refresh();
        });
      }, 2000);
    }
  }, [orgId, router, step]);

  return (
    <motion.div
      className="shadox-xl bg-opacity-60 flex h-full w-full flex-col items-center justify-center p-8"
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ background: "transparent" }}
      animate={{ background: "var(--background)" }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, x: 250 },
          show: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4, type: "spring" },
          },
        }}
        initial="hidden"
        animate="show"
        className="flex flex-col space-y-4 rounded-xl bg-background/60 p-8"
      >
        <h1 className="font-cal text-2xl font-bold transition-colors sm:text-3xl">
          You are all set!
        </h1>
        <p className="max-w-md text-muted-foreground transition-colors sm:text-lg">
          Congratulations, you have successfully created your first project.
          Check out the <Link href="/docs">docs</Link> to learn more on how to
          use the platform.
        </p>
        <p className="text-sm text-muted-foreground">
          You will be redirected to your project momentarily.
        </p>
      </motion.div>
    </motion.div>
  );
}
