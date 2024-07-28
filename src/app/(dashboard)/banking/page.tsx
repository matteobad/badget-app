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
          <h1 className="text-2xl font-semibold">Banking</h1>
        </header>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
      <TabsContent value="accounts">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Accounts Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Accounts</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Transactions Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Transactions</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
