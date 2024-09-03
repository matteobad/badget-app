import { type Provider } from "~/server/db/schema/enum";

export function LoadingStep({
  reference,
  provider,
}: {
  reference: string;
  provider: Provider;
}) {
  return <div>Loading</div>;
}
