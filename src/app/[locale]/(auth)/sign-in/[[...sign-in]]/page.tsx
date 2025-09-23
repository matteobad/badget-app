import type { Metadata } from "next";
import Link from "next/link";
import { PasswordSignIn } from "~/components/auth/password-sign-in";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Login | Badget.",
};

export default async function SignIn() {
  const tScoped = await getScopedI18n("auth");
  const preferredSignInOption = <PasswordSignIn />;
  // const moreSignInOptions = <PasskeySignIn />;

  return (
    <div className="p-2">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-4 font-serif text-lg">{tScoped("signin_title")}</h1>
        <p className="mb-8 text-sm text-[#878787]">
          {tScoped("signin_subtitle")}
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        {/* Primary Sign In Option */}
        <div className="space-y-3">{preferredSignInOption}</div>

        <div className="flex items-center justify-center">
          <span className="text-sm text-[#878787]">Or</span>
        </div>

        {/* More Options Accordion */}
        {/* <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-0">
                    <AccordionTrigger className="flex items-center justify-center py-2 text-sm hover:no-underline">
                      <span>Other options</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-3">{moreSignInOptions}</div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion> */}

        {/* Sign-up Option */}
        <div className="w-full text-center text-sm">
          {tScoped("no_account")}{" "}
          <Link href="/sign-up" className="ml-auto inline-block underline">
            Sign-up
          </Link>
        </div>
      </div>
    </div>
  );
}
