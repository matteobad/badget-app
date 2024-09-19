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
import { CreateAccountForm } from "./create-account-form";
import SearchInstitution from "./search-institution";

export function CreateAccountDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi un conto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-sm">
        <DialogHeader className="text-left">
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
            <SearchInstitution />
          </TabsContent>
          <TabsContent value="manual" className="pt-2">
            <CreateAccountForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
