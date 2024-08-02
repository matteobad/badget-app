import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddFundDialog } from "./_components/add-fund-dialog";

export default function SavingsLayout(props: {
  children: React.ReactNode;
  emergency: React.ReactNode;
  pension: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-130px)] overflow-hidden p-6">
      <Tabs
        defaultValue="overview"
        className="flex w-full flex-col justify-center gap-2"
      >
        <div className="mb-4 flex items-center justify-between">
          <TabsList className="self-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="pension">Pension</TabsTrigger>
          </TabsList>

          <AddFundDialog />
        </div>
        <TabsContent value="overview" className="flex-1">
          {props.children}
        </TabsContent>
        <TabsContent value="emergency" className="flex-1">
          {props.emergency}
        </TabsContent>
        <TabsContent value="pension" className="flex flex-1">
          {props.pension}
        </TabsContent>
      </Tabs>
    </div>
  );
}
