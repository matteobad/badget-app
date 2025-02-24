import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { UploadDropzone } from "~/utils/uploadthing";
import { updateAccountAction } from "../server/actions";
import { AccountUpdateSchema } from "../utils/schemas";
import { AccountTypePicker } from "./account-type-picker";

export default function UpdateAccountForm({
  account,
  onComplete,
  className,
}: {
  account: DB_AccountType;
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const { execute, isExecuting, reset } = useAction(updateAccountAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success(data?.message);
      reset();
      onComplete();
    },
  });

  const form = useForm<z.infer<typeof AccountUpdateSchema>>({
    resolver: zodResolver(AccountUpdateSchema),
    defaultValues: {
      id: account.id,
      balance: account.balance,
      currency: account.currency,
      description: account.description ?? undefined,
      name: account.name,
      type: account.type,
      enabled: account.enabled,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Tipologia</FormLabel>
                <AccountTypePicker
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="multiple">
          <AccordionItem value="attachment">
            <AccordionTrigger className="text-sm">Allegati</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <UploadDropzone
                  content={{
                    uploadIcon: <></>,
                  }}
                  className="mt-0 h-[200px]"
                  endpoint="attachmentUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    // const serverData = res[0]?.serverData.attachments ?? "[]";
                    // const uploaded = JSON.parse(
                    //   serverData,
                    // ) as DB_AttachmentType[];
                    // const attachmentIds = uploaded.map((_) => _.id);
                    // setAttachments(uploaded);
                    // form.setValue("attachment_ids", attachmentIds);
                    toast.info("Attachment caricati");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    console.error(error.message);
                    toast.error(error.message);
                  }}
                />
              </div>
              {/* <ul className="mt-4 space-y-4">
                {attachments.map((file) => (
                  <div
                    className="flex items-center justify-between"
                    key={file.fileKey}
                  >
                    <div className="flex w-80 flex-col space-y-0.5">
                      <span className="truncate">{file.fileName}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.fileSize && formatSize(file.fileSize)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="flex w-auto hover:bg-transparent"
                      disabled={deleteAttachment.isExecuting}
                      onClick={() =>
                        deleteAttachment.execute({
                          id: file.id,
                          fileKey: file.fileKey,
                        })
                      }
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </ul> */}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="exclude">
            <AccordionTrigger className="text-sm">Escludi</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel className="mt-0 text-sm font-normal text-muted-foreground">
                      Mark as enabled. Enabled account will receive periodical
                      updates of balance and transactions.
                    </FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="note">
            <AccordionTrigger className="text-sm">Descrizione</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Textarea
                        placeholder="Informazioni aggiuntive"
                        className="min-h-[100px] resize-none bg-white shadow-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button className="w-full" type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Modifico account...
              </>
            ) : (
              "Modifica account"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
