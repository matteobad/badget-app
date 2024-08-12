import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function PensionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Overview Description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">Overview</CardContent>
    </Card>
  );
}
