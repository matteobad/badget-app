import { cn } from "~/lib/utils";

import { BankLogo } from "../bank-logo";

type Props = {
  logoUrl?: string;
  name?: string;
  size?: number;
  className?: string;
};

export function TransactionBankAccount({
  logoUrl,
  name,
  size = 20,
  className,
}: Props) {
  return (
    <div className="mt-1 flex items-center space-x-2">
      {logoUrl && (
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ width: size, height: size }}
        >
          <BankLogo size={size} src={logoUrl} alt={name ?? ""} />
        </div>
      )}
      <span className={cn("line-clamp-1 text-sm", className)}>{name}</span>
    </div>
  );
}
