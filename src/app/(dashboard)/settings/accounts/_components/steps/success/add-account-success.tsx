"use client";

import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { PartyPopperIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

export function AddAccountSuccess() {
  useEffect(() => {
    void confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.45 },
    });
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-10 px-4 py-10 text-center text-xl">
        <div className="rounded-full border p-4">
          <PartyPopperIcon className="h-10 w-10" />
        </div>
        <span className="px-6">
          Congratulazioni!
          <br />
          <br />
          Da oggi tracceremo per te l&apos;andamento del tuo fondo.
        </span>
      </div>
      <div className="flex justify-center gap-4 pb-12">
        <Button asChild>
          <Link href="/">Vai alla Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
