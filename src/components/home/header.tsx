"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import {
  LandmarkIcon,
  LayoutDashboardIcon,
  ReceiptEuroIcon,
  RocketIcon,
  VaultIcon,
} from "lucide-react";
import logoDark from "public/logo-dark.svg";
import logoLight from "public/logo-light.svg";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const listVariant = {
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const itemVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export function Header() {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastPath = `/${pathname.split("/").pop()}`;

  useEffect(() => {
    const setPixelRatio = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      document.documentElement.style.setProperty(
        "--pixel-ratio",
        `${1 / pixelRatio}`,
      );
    };

    setPixelRatio();
    window.addEventListener("resize", setPixelRatio);

    return () => window.removeEventListener("resize", setPixelRatio);
  }, []);

  const handleToggleMenu = () => {
    setOpen((prev) => {
      document.body.style.overflow = prev ? "" : "hidden";
      return !prev;
    });
  };

  const handleOnClick = () => {
    setShowBlur(false);
    setHidden(true);

    setTimeout(() => {
      setHidden(false);
    }, 100);
  };

  const links = [
    {
      title: "Features",
      children: [
        {
          path: "/overview",
          title: "Overview",
          description:
            "See all your accounts, budgets, and financial health in one place.",
          icon: <LayoutDashboardIcon size={20} />,
        },
        {
          path: "/transactions",
          title: "Transactions",
          description:
            "Track and manage all your financial transactions in detail.",
          icon: <ReceiptEuroIcon size={20} />,
        },
        {
          path: "/accounts",
          title: "Accounts",
          description: "View and organize your bank accounts and balances.",
          icon: <LandmarkIcon size={20} />,
        },
        {
          path: "/vault",
          title: "Vault",
          description:
            "Securely store and manage your savings and financial goals.",
          icon: <VaultIcon size={20} />,
        },
      ],
    },
    {
      title: "Pricing",
      path: "/pricing",
    },
  ];

  if (pathname.includes("pitch")) {
    return null;
  }

  return (
    <header className="sticky top-4 z-50 mt-4 justify-center px-2 md:flex md:px-4">
      <nav className="bg-opacity-70 relative z-20 flex h-[50px] items-center border border-border bg-[#FFFFFF] px-4 backdrop-blur-xl backdrop-filter dark:bg-[#121212]">
        <Link href="/">
          <span className="sr-only">Badget Logo</span>

          <Image
            src={logoDark}
            alt="Logo"
            className="object-cover dark:hidden"
            priority
            width={24}
            height={24}
          />
          <Image
            src={logoLight}
            alt="Logo"
            className="hidden object-cover dark:block"
            priority
            width={24}
            height={24}
          />
        </Link>

        <ul className="mx-3 hidden space-x-2 text-sm font-medium md:flex">
          {links.map(({ path, title, children }) => {
            if (path) {
              return (
                <li key={path}>
                  <Link
                    onClick={handleOnClick}
                    href={path}
                    className="inline-flex h-8 items-center justify-center px-3 py-2 text-sm font-medium text-secondary-foreground transition-opacity duration-200 hover:opacity-70"
                  >
                    {title}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={title}
                className="group"
                onMouseEnter={() => setShowBlur(true)}
                onMouseLeave={() => setShowBlur(false)}
              >
                <span className="inline-flex h-8 cursor-pointer items-center justify-center px-3 py-2 text-sm font-medium text-secondary-foreground transition-opacity duration-200 hover:opacity-70">
                  {title}
                </span>

                {children && (
                  <div
                    className={cn(
                      "absolute top-[48px] left-0 -mx-[calc(var(--pixel-ratio)_*_2px)] flex h-0 overflow-hidden border-r border-l bg-[#fff] transition-all duration-300 ease-in-out group-hover:h-[470px] dark:bg-[#121212]",
                      hidden && "hidden",
                    )}
                  >
                    <ul className="mt-2 grid w-full flex-1 gap-4 p-4">
                      {children.map((child) => {
                        return (
                          <li key={child.path} className="border p-4">
                            <Link
                              onClick={handleOnClick}
                              href={child.path}
                              className="flex flex-col items-start gap-2 transition-opacity duration-200 hover:opacity-70"
                            >
                              <div className="flex items-center gap-2">
                                <span>{child.icon}</span>
                                <span className="text-sm font-medium">
                                  {child.title}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {child.description}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="absolute bottom-0 w-full border-b-[1px]" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="ml-auto p-2 md:hidden"
          onClick={() => handleToggleMenu()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={13}
            fill="none"
          >
            <path
              fill="currentColor"
              d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
            />
          </svg>
        </button>

        <Link
          className="hidden border-l-[1px] border-border pr-2 pl-4 text-sm font-medium md:block"
          href="/sign-in"
        >
          Sign in
        </Link>
      </nav>

      {isOpen && (
        <motion.div
          className="fixed -top-[2px] right-0 bottom-0 left-0 z-10 h-screen bg-background px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative mt-4 ml-[1px] flex justify-between p-3 px-4">
            <button type="button" onClick={handleToggleMenu}>
              <span className="sr-only">Badget Logo</span>
              <RocketIcon />
            </button>

            <button
              type="button"
              className="absolute top-2 right-[10px] ml-auto p-2 md:hidden"
              onClick={handleToggleMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                className="fill-primary"
              >
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>

          <div className="h-screen overflow-auto pb-[150px]">
            <motion.ul
              initial="hidden"
              animate="show"
              className="mb-8 space-y-8 overflow-auto px-3 pt-8 text-xl text-[#878787]"
              variants={listVariant}
            >
              {links.map(({ path, title, children }) => {
                const isActive =
                  path === "/updates"
                    ? pathname.includes("updates")
                    : path === lastPath;

                if (path) {
                  return (
                    <motion.li variants={itemVariant} key={path}>
                      <Link
                        href={path}
                        className={cn(isActive && "text-primary")}
                        onClick={handleToggleMenu}
                      >
                        {title}
                      </Link>
                    </motion.li>
                  );
                }

                return (
                  <li key={title}>
                    <Accordion collapsible type="single">
                      <AccordionItem value="item-1" className="border-none">
                        <AccordionTrigger className="flex w-full items-center justify-between p-0 font-normal hover:no-underline">
                          <span className="text-[#878787]">{title}</span>
                        </AccordionTrigger>

                        {children && (
                          <AccordionContent className="text-xl">
                            <ul className="mt-6 ml-4 space-y-8">
                              {children.map((child) => {
                                return (
                                  <li key={child.path}>
                                    <Link
                                      onClick={handleToggleMenu}
                                      href={child.path}
                                      className="text-[#878787]"
                                    >
                                      {child.title}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    </Accordion>
                  </li>
                );
              })}

              <motion.li
                className="mt-auto border-t-[1px] pt-8"
                variants={itemVariant}
              >
                <Link
                  className="text-xl text-primary"
                  href="https://app.Badget.ai"
                >
                  Sign in
                </Link>
              </motion.li>
            </motion.ul>
          </div>
        </motion.div>
      )}

      <div
        className={cn(
          "invisible fixed top-0 left-0 z-10 h-screen w-screen opacity-0 backdrop-blur-md transition-all duration-300",
          showBlur && "opacity-100 md:visible",
        )}
      />
    </header>
  );
}
