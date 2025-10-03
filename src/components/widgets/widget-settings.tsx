"use client";

import type {
  RevenueType,
  WidgetConfig,
  WidgetPeriod,
} from "~/server/cache/widget-preferences-cache";
import { useState } from "react";
import { useScopedI18n } from "~/shared/locales/client";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface WidgetSettingsProps {
  config?: WidgetConfig;
  onSave: (config: WidgetConfig) => void;
  onCancel: () => void;
  showPeriod?: boolean;
  showRevenueType?: boolean;
}

const periodOptions: WidgetPeriod[] = [
  "fiscal_ytd",
  "fiscal_year",
  "current_quarter",
  "trailing_12",
  "current_month",
];

export function WidgetSettings({
  config,
  onSave,
  onCancel,
  showPeriod = true,
  showRevenueType = false,
}: WidgetSettingsProps) {
  const t = useScopedI18n("widgets.settings");
  const [period, setPeriod] = useState<WidgetPeriod | undefined>(
    config?.period ?? "fiscal_ytd",
  );
  const [revenueType, setRevenueType] = useState<RevenueType | undefined>(
    config?.revenueType ?? "net",
  );

  const getPeriodLabel = (p: WidgetPeriod) => {
    return t(`widget_period.${p}` as "widget_period.fiscal_ytd");
  };

  const handleSave = () => {
    const newConfig: WidgetConfig = {};
    if (showPeriod && period) {
      newConfig.period = period;
    }
    if (showRevenueType && revenueType) {
      newConfig.revenueType = revenueType;
    }
    onSave(newConfig);
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-1">
        {showPeriod && (
          <div className="space-y-1">
            <Label htmlFor="period" className="text-xs text-muted-foreground">
              Period
            </Label>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as WidgetPeriod)}
            >
              <SelectTrigger id="period" className="w-full" size="sm">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getPeriodLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showRevenueType && (
          <div className="space-y-1">
            <Label
              htmlFor="revenueType"
              className="text-xs text-muted-foreground"
            >
              Type
            </Label>
            <Select
              value={revenueType}
              onValueChange={(value) => setRevenueType(value as RevenueType)}
            >
              <SelectTrigger id="revenueType" className="h-8 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Net</SelectItem>
                <SelectItem value="gross">Gross</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 flex-1 text-xs"
          type="button"
        >
          {t("widget_action.cancel")}
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="h-8 flex-1 text-xs"
          type="button"
        >
          {t("widget_action.save")}
        </Button>
      </div>
    </div>
  );
}
