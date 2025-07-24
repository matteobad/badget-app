// import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
// import { CurrencyInput } from "~/components/custom/currency-input";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "~/components/ui/accordion";
// import { Button } from "~/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import { Input } from "~/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "~/components/ui/select";
// import { Textarea } from "~/components/ui/textarea";
// import { cn } from "~/lib/utils";
// import { UploadDropzone } from "~/utils/uploadthing";
// import { Loader2Icon } from "lucide-react";
// import { useAction } from "next-safe-action/hooks";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { type z } from "zod/v4";

// // import { createAccountAction } from "../server/actions";
// // import { AccountInsertSchema } from "../utils/schemas";
// // import { AccountTypePicker } from "./account-type-picker";

// export default function CreateAccountForm({
//   onComplete,
//   className,
// }: {
//   onComplete: () => void;
// } & React.ComponentProps<"form">) {
//   const { execute, isExecuting, reset } = useAction(createAccountAction, {
//     onError: ({ error }) => {
//       console.error(error);
//       toast.error(error.serverError);
//     },
//     onSuccess: ({ data }) => {
//       toast.success(data?.message);
//       reset();
//       onComplete();
//     },
//   });

//   const form = useForm<z.infer<typeof AccountInsertSchema>>({
//     resolver: standardSchemaResolver(AccountInsertSchema),
//     defaultValues: {
//       name: "",
//       balance: 0,
//       currency: "EUR",
//     },
//   });

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(execute)}
//         className={cn("flex h-full flex-col gap-4", className)}
//       >
//         {/* <pre>
//           <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
//         </pre> */}

//         <div className="grid w-full grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem className="col-span-2 flex flex-col">
//                 <FormLabel>Nome account</FormLabel>
//                 <FormControl>
//                   <Input
//                     {...field}
//                     placeholder=""
//                     autoComplete="off"
//                     autoCapitalize="none"
//                     autoCorrect="off"
//                     spellCheck="false"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="type"
//             render={({ field }) => (
//               <FormItem className="col-span-2 flex flex-col">
//                 <FormLabel>Tipologia</FormLabel>
//                 <AccountTypePicker
//                   onValueChange={field.onChange}
//                   value={field.value ?? undefined}
//                 />
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="balance"
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <FormLabel>Importo</FormLabel>
//                 <FormControl>
//                   <CurrencyInput
//                     value={field.value}
//                     onValueChange={(values) => {
//                       field.onChange(values.floatValue);
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="currency"
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <FormLabel>Valuta</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Seleziona valuta" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="EUR">EUR</SelectItem>
//                     <SelectItem value="USD">USD</SelectItem>
//                     <SelectItem value="GBP">GBP</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <Accordion type="multiple">
//           <AccordionItem value="attachment">
//             <AccordionTrigger className="text-sm">Allegati</AccordionTrigger>
//             <AccordionContent className="space-y-2">
//               <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
//                 <UploadDropzone
//                   content={{
//                     uploadIcon: <></>,
//                   }}
//                   className="mt-0 h-[200px]"
//                   endpoint="attachmentUploader"
//                   onClientUploadComplete={(res) => {
//                     // Do something with the response
//                     console.log("Files: ", res);
//                     // const serverData = res[0]?.serverData.attachments ?? "[]";
//                     // const uploaded = JSON.parse(
//                     //   serverData,
//                     // ) as DB_AttachmentType[];
//                     // const attachmentIds = uploaded.map((_) => _.id);
//                     // setAttachments(uploaded);
//                     // form.setValue("attachment_ids", attachmentIds);
//                     toast.info("Attachment caricati");
//                   }}
//                   onUploadError={(error: Error) => {
//                     // Do something with the error.
//                     console.error(error.message);
//                     toast.error(error.message);
//                   }}
//                 />
//               </div>
//             </AccordionContent>
//           </AccordionItem>
//           <AccordionItem value="note">
//             <AccordionTrigger className="text-sm">Descrizione</AccordionTrigger>
//             <AccordionContent>
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormControl>
//                       <Textarea
//                         placeholder="Informazioni aggiuntive"
//                         className="min-h-[100px] resize-none bg-white shadow-none"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </AccordionContent>
//           </AccordionItem>
//         </Accordion>

//         <div className="grow"></div>
//         <div className="flex items-center gap-4">
//           <Button className="w-full" type="submit" disabled={isExecuting}>
//             {isExecuting ? (
//               <>
//                 <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
//                 Creo conto...
//               </>
//             ) : (
//               "Crea conto"
//             )}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
