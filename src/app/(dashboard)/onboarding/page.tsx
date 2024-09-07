import { BankingOnboarding } from "./banking/banking-onboarding";
import { searchParamsCache } from "./banking/search-params";
import Features from "./features";
import Intro from "./intro";
import { Onboarding } from "./multi-step-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const { step } = searchParamsCache.parse(searchParams);

  return (
    <>
      <Onboarding>
        {!step && <Intro key="intro" />}
        {step === "features" && <Features />}
        {step.includes("banking") && <BankingOnboarding />}
        {/* {step.includes("savings") && <BankingOnboarding />}
        {step.includes("pension") && <BankingOnboarding />}
        {step.includes("investments") && <BankingOnboarding />} */}
      </Onboarding>
      <div className="absolute inset-0 top-12 -z-10 bg-cover bg-center" />
    </>
  );
}
