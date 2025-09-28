import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useWidget } from "../widget";

export function IncomeWidgetSettings() {
  const { draftSettings, setDraftSettings } = useWidget();

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
        onValueChange={(value) =>
          setDraftSettings({ ...draftSettings, period: value })
        }
        defaultValue={draftSettings?.period ?? "month"}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="week">Week</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          setDraftSettings({ ...draftSettings, type: value })
        }
        defaultValue={draftSettings?.type ?? "gross"}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gross">Gross</SelectItem>
          <SelectItem value="net">Net</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
