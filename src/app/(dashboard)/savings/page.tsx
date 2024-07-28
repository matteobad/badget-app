import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function PensionPage() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-semibold">Savings</h1>
        </header>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="pension">Pension</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Overview Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Overview</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="emergency">
        <Card>
          <CardHeader>
            <CardTitle>Emergency</CardTitle>
            <CardDescription>Emergency Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Emergency</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pension">
        <Card>
          <CardHeader>
            <CardTitle>Pension</CardTitle>
            <CardDescription>Pension Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Pension</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
