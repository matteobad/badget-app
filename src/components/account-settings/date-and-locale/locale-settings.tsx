"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ComboboxDropdown } from "~/components/ui/combobox-dropdown";
import { useUserMutation, useUserQuery } from "~/hooks/use-user";
import { getCountries } from "~/server/services/location-service";
import { useI18n } from "~/shared/locales/client";

export function LocaleSettings() {
  const t = useI18n();
  const { data: user } = useUserQuery();
  const updateUserMutation = useUserMutation();

  const countries = getCountries();
  const localeItems = Object.values(countries).map((c, index) => ({
    id: index.toString(),
    label: `${c.name} (${c.default_locale})`,
    value: c.default_locale,
  }));

  return (
    <Card className="flex items-center justify-between">
      <CardHeader>
        <CardTitle>{t("locale.title")}</CardTitle>
        <CardDescription>{t("locale.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-[250px]">
          <ComboboxDropdown
            placeholder={t("locale.placeholder")}
            selectedItem={localeItems.find(
              (item) => item.value === user?.locale,
            )}
            searchPlaceholder={t("locale.searchPlaceholder")}
            items={localeItems}
            className="py-1 text-xs"
            onSelect={(item) => {
              updateUserMutation.mutate({ locale: item.value });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
