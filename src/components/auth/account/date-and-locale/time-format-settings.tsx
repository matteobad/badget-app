"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUserMutation, useUserQuery } from "~/hooks/use-user";

export function TimeFormatSettings() {
  const updateUserMutation = useUserMutation();
  const { data: user } = useUserQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Display Format</CardTitle>
        <CardDescription>
          Choose between 12-hour or 24-hour clock format for displaying time.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Select
          defaultValue={user?.timeFormat?.toString() ?? undefined}
          onValueChange={(value) => {
            updateUserMutation.mutate({ timeFormat: +value });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 hours (AM/PM)</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
