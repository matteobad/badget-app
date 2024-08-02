import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function EmergencyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Funs</CardTitle>
        <CardDescription>Emergency Funs Description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">Emergency Funs</CardContent>
    </Card>
  );
}
