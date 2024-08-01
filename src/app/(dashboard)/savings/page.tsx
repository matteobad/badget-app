import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddPensionAccountDialog } from "./_components/add-pension-account";
import {
  findAllPensionFunds,
  PensionAccountList,
} from "./_components/pension-accounts";

export default function SavingsPage() {
  const pensionFundsPromise = findAllPensionFunds();

  return (
    <Tabs
      defaultValue="overview"
      className="flex w-full flex-col justify-center"
    >
      <div className="mb-6 flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-semibold">Savings</h1>
        </header>
        <AddPensionAccountDialog pensionFundsPromise={pensionFundsPromise} />
      </div>
      <TabsList className="self-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="emergency">Emergency</TabsTrigger>
        <TabsTrigger value="pension">Pension</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Overview Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Overview</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="emergency" className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Emergency</CardTitle>
            <CardDescription>Emergency Description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">Emergency</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pension" className="flex flex-1">
        {/* <Card className="w-full">
          <CardContent> */}
        <PensionAccountList />
        {/* </CardContent>
        </Card> */}
      </TabsContent>
    </Tabs>
  );
}
