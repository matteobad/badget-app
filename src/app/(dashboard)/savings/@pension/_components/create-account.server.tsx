import { CreatePensionAccountForm } from "~/components/forms/create-pension-account-form";
import { findAllPensionFunds } from "~/lib/data";

export async function CreateAccountServer() {
  const pensionFunds = await findAllPensionFunds();

  return <CreatePensionAccountForm pensionFunds={pensionFunds} />;
}
