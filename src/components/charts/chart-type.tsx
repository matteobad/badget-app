"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { useScopedI18n } from "~/shared/locales/client";
import { chartTypeOptions } from "~/shared/validators/metrics.schema";

type Props = {
  disabled?: boolean;
};

export function ChartType({ disabled }: Props) {
  const tScoped = useScopedI18n("chart_type");
  const { params, setParams } = useMetricsParams();

  return (
    <Select
      defaultValue={params.chart}
      onValueChange={(value) => {
        if (value) {
          void setParams({
            ...params,
            chart: value as NonNullable<typeof params.chart>,
          });
        }
      }}
    >
      <SelectTrigger
        className="!h-10 flex-1 space-x-1 font-medium"
        disabled={disabled}
      >
        <span>{tScoped(params.chart)}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {chartTypeOptions.map((option) => {
            return (
              <SelectItem key={option} value={option}>
                {tScoped(option)}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
