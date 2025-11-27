import Image from "next/image";
import Link from "next/link";
import appIcon from "public/app-icon.png";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center text-sm text-[#606060]">
      <Image
        src={appIcon}
        width={80}
        height={80}
        alt="Badget"
        quality={100}
        className="mb-10"
      />
      <h2 className="mb-2 text-xl font-semibold">Not Found</h2>
      <p className="mb-4">Could not find requested resource</p>
      <Link href="/" className="underline">
        Return Home
      </Link>
    </div>
  );
}
