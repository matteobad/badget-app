// import type { NumericFormatProps } from "react-number-format";
// import { useState } from "react";
// import { cn } from "~/lib/utils";
// import { useController, useFormContext } from "react-hook-form";

// import type { SelectCategory } from "../transaction-category/select-category";
// import { CurrencyInput } from "../custom/currency-input";

// export function CategoryInput({
//   className,
//   name,
//   ...props
// }: React.ComponentProps<typeof SelectCategory> & {
//   name: string;
// }) {
//   const [isFocused, setIsFocused] = useState(false);
//   const { control } = useFormContext();
//   const {
//     field: { value, onChange, onBlur },
//   } = useController({
//     name,
//     control,
//   });

//   const isPlaceholder = !value && !isFocused;

//   return (
//     <div className="relative font-mono">
//       <SelectCategory
//         selected={value}
//         onChange={(value) => {
//           onChange(value, { shouldValidate: true });
//         }}
//         onFocus={() => setIsFocused(true)}
//         onBlur={() => {
//           setIsFocused(false);
//           onBlur();
//         }}
//         {...props}
//         // className={cn(
//         //   className,
//         //   isPlaceholder && "opacity-0",
//         //   "h-6 border-0 border-b border-transparent !bg-transparent p-0 text-xs focus:border-border",
//         // )}
//       />

//       {isPlaceholder && (
//         <div className="pointer-events-none absolute inset-0">
//           <div className="h-full w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]" />
//         </div>
//       )}
//     </div>
//   );
// }
