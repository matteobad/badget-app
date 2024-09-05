"use client";

import { Avatar, AvatarImage } from "./ui/avatar";

type Props = {
  src: string | null;
  alt: string;
  size?: number;
};

export default function BankLogo({ src, alt, size = 34 }: Props) {
  return (
    <Avatar style={{ width: size, height: size }} className="rounded-none">
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarImage src="https://cdn-engine.midday.ai/default.jpg" alt={alt} />
    </Avatar>
  );
}
