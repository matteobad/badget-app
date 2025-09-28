import type { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type WidgetSettings = {
  period?: string;
  type?: string;
};

type Props = {
  settings: WidgetSettings;
  setSettings: Dispatch<SetStateAction<WidgetSettings>>;
};

export function IncomeWidgetSettingsForm({ settings, setSettings }: Props) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Select
        onValueChange={(value) => setSettings({ ...settings, period: value })}
        defaultValue={settings?.period ?? "month"}
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
        onValueChange={(value) => setSettings({ ...settings, type: value })}
        defaultValue={settings?.type ?? "gross"}
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
