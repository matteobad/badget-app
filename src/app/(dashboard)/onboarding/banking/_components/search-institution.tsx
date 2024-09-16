import { Search } from "lucide-react";

import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { useSearchParams } from "../_hooks/use-search-params";

export default function SearchInstitution({
  institutions,
}: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
}) {
  const [, setParams] = useSearchParams();

  return (
    <div className="flex flex-col gap-2">
      <div className="relative grid grid-cols-3 gap-2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="col-span-2 pl-10"
          placeholder="Cerca istituto finanziario"
          type="search"
          onChange={(e) => {
            void setParams({ q: e.target.value }, { shallow: true });
          }}
        />
        <Select value="IT">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="ES">ES</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="-ml-4 h-[200px]">
        <ul className="-mr-4 grid grid-cols-1 gap-1">
          {institutions.map((institution) => (
            <li key={institution.id} className="flex items-center">
              <ConnectBankProvider
                provider={institution.provider}
                id={institution.id}
                availableHistory={institution.availableHistory ?? 90}
              >
                <div className="flex h-12 w-full items-center justify-start gap-2 rounded-none pl-4 text-left text-sm font-normal hover:bg-muted">
                  <Avatar className="h-8 w-8 rounded-none">
                    <AvatarImage src={institution.logo ?? ""} />
                    <AvatarFallback>{institution.name}</AvatarFallback>
                  </Avatar>
                  <span className="w-[80%] truncate">{institution.name}</span>
                </div>
              </ConnectBankProvider>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
