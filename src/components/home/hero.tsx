import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/shared/helpers/better-auth/auth";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "../ui/button";
import { HeroImage } from "./hero-image";
import { Metrics } from "./metrics";
import { WordAnimation } from "./word-animation";

export function Hero() {
  return (
    <section className="relative mt-[60px] min-h-[530px] lg:mt-[180px] lg:h-[calc(100vh-300px)]">
      <div className="flex flex-col">
        <h2 className="mt-6 max-w-[580px] text-[24px] leading-tight font-medium text-[#878787] md:mt-10 md:text-[36px]">
          Effortless budgeting, expense tracking, bill reminders, savings goals,
          and a smart assistant designed for <WordAnimation />
        </h2>

        <div className="mt-8 md:mt-10">
          <div className="flex items-center space-x-4">
            <form
              action={async () => {
                "use server";

                const session = await auth.api.getSession({
                  headers: await headers(),
                });

                if (!session) {
                  return redirect("/sign-in");
                }

                return redirect("/overview");
              }}
            >
              <Button
                size="lg"
                type="submit"
                className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
              >
                Get Started
                <ArrowRightIcon />
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-4 font-mono text-xs text-[#707070]">
          Start free trial, no credit card required.
        </p>
      </div>

      <HeroImage />
      <Metrics />
    </section>
  );
}
