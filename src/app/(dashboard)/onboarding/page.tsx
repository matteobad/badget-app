import { BankingOnboarding } from "./banking";
import { searchParamsCache } from "./banking/_utils/search-params";
import Features from "./features";
import Intro from "./intro";

export default async function OnboardingPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const { step } = searchParamsCache.parse(searchParams);

  return (
    <>
      {!step && <Intro key="intro" />}
      {step === "features" && <Features />}
      {step.includes("banking") && <BankingOnboarding />}
      {/* {step.includes("savings") && <BankingOnboarding />}
        {step.includes("pension") && <BankingOnboarding />}
        {step.includes("investments") && <BankingOnboarding />} */}
      <div className="absolute inset-0 top-12 -z-10 bg-cover bg-center" />
    </>
  );
}
