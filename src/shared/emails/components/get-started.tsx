import { Section } from "@react-email/components";

import { Button } from "./button";

export function GetStarted() {
  return (
    <Section className="mt-[50px] mb-[50px] text-center">
      {/* TODO: create a custom page to track events */}
      <Button href="https://badget-app-eight.vercel.app/">Get started</Button>
    </Section>
  );
}
