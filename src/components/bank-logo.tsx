import { useState } from "react";
import { cn } from "~/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
  src: string | null;
  alt: string;
  size?: number;
};

export function BankLogo({ src, alt, size = 34 }: Props) {
  const [hasError, setHasError] = useState(false);
  const showingFallback = !src || hasError;

  return (
    <Avatar
      style={{ width: size, height: size }}
      className={cn(!showingFallback && "rounded-none")}
    >
      {src && !hasError ? (
        <AvatarImage
          src={src}
          alt={alt}
          className="bg-white object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <AvatarImage
          src="https://cdn-engine.midday.ai/default.jpg"
          alt={alt}
          className="object-contain"
        />
      )}
      <AvatarFallback>
        <AvatarImage
          src="https://cdn-engine.midday.ai/default.jpg"
          alt={alt}
          className="object-contain"
        />
      </AvatarFallback>
    </Avatar>
  );
}
