import dynamic from "next/dynamic";
import { type LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";

import type { JSX } from "react";

export type Icon = (props: LucideProps) => JSX.Element;

export const System: Icon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m11.998 2c5.517 0 9.997 4.48 9.997 9.998 0 5.517-4.48 9.997-9.997 9.997-5.518 0-9.998-4.48-9.998-9.997 0-5.518 4.48-9.998 9.998-9.998zm0 1.5c-4.69 0-8.498 3.808-8.498 8.498s3.808 8.497 8.498 8.497z"
      fillRule="nonzero"
      fill="currentColor"
    />
  </svg>
);

interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name], {
    loading: () => <Skeleton className={cn(props.className, "rounded-full")} />,
  });

  return <LucideIcon {...props} />;
};

export default Icon;
