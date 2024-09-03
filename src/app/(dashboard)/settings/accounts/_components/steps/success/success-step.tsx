import { type Provider } from "~/server/db/schema/enum";

export function SuccessStep({
  reference,
  provider,
}: {
  reference: string;
  provider: Provider;
}) {
  return <div>Success</div>;
}
