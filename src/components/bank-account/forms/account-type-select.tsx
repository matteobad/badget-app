import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { AccountSubtype, AccountType } from "~/shared/constants/enum";
import { ACCOUNT_SUBTYPE, ACCOUNT_TYPE } from "~/shared/constants/enum";
import { useScopedI18n } from "~/shared/locales/client";

const ASSET_SUBTYPES = new Set<AccountSubtype>([
  ACCOUNT_SUBTYPE.CASH,
  ACCOUNT_SUBTYPE.CHECKING,
  ACCOUNT_SUBTYPE.SAVINGS,
  ACCOUNT_SUBTYPE.INVESTMENT,
  ACCOUNT_SUBTYPE.PROPERTY,
]);

const LIABILITY_SUBTYPES = new Set<AccountSubtype>([
  ACCOUNT_SUBTYPE.CREDIT_CARD,
  ACCOUNT_SUBTYPE.LOAN,
  ACCOUNT_SUBTYPE.MORTGAGE,
  ACCOUNT_SUBTYPE.OTHER_LIABILITY,
]);

type AccountTypeSelectProps = {
  value?: string | undefined;
  onValueChange?: (type: AccountType, subType: AccountSubtype) => void;
};

export function AccountTypeSelect({
  value,
  onValueChange,
}: AccountTypeSelectProps) {
  const tType = useScopedI18n("account.type");
  const tSubtype = useScopedI18n("account.subtype");

  return (
    <Select
      value={value}
      onValueChange={(value) => {
        const selectedSubtype = value as AccountSubtype;

        const derivedType = ASSET_SUBTYPES.has(selectedSubtype)
          ? ACCOUNT_TYPE.ASSET
          : ACCOUNT_TYPE.LIABILITY;

        onValueChange?.(derivedType, selectedSubtype);
      }}
    >
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="Select a type" />
      </SelectTrigger>
      <SelectContent className="">
        <SelectGroup>
          <SelectLabel>{tType(ACCOUNT_TYPE.ASSET)}</SelectLabel>
          {[...ASSET_SUBTYPES].map((subtype) => {
            return (
              <SelectItem value={subtype} key={subtype}>
                <span className="truncate">{tSubtype(subtype)}</span>
              </SelectItem>
            );
          })}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>{tType(ACCOUNT_TYPE.LIABILITY)}</SelectLabel>
          {[...LIABILITY_SUBTYPES].map((subtype) => {
            return (
              <SelectItem value={subtype} key={subtype}>
                <span className="truncate">{tSubtype(subtype)}</span>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
