import { type Provider } from "~/server/db/schema/enum";
import { AddAccountSuccess } from "./add-account-success";

export function SuccessStep({}: { reference: string; provider: Provider }) {
  return (
    <div>
      <AddAccountSuccess />
    </div>
  );
}
