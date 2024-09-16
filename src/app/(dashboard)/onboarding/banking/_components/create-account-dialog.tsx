"use client";

import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type getPendingBankConnections } from "~/lib/data";
import { type getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { CreateAccountForm } from "./create-account-form";
import SearchInstitution from "./search-institution";

export function CreateAccountDialog({
  connections,
  institutions,
}: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
  connections: Awaited<ReturnType<typeof getPendingBankConnections>>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={connections.length !== 0}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi un conto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%]">
        <DialogHeader>
          <DialogTitle>Aggiungi un conto</DialogTitle>
          <DialogDescription>
            Puoi aggiungere un conto bancario collegandolo direttamente al tuo
            istituto finanziario oppure aggiungendo i dati del conto
            manualmente.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="account">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linked">Collega un conto</TabsTrigger>
            <TabsTrigger value="manual">Traccia a mano</TabsTrigger>
          </TabsList>
          <TabsContent value="linked" className="pt-2">
            <SearchInstitution institutions={institutions} />
          </TabsContent>
          <TabsContent value="manual" className="pt-2">
            <CreateAccountForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
