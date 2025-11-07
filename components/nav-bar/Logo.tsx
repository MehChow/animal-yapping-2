import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 cursor-pointer absolute left-8"
    >
      <div className="relative aspect-video w-16">
        <Image src="/logo.jpg" alt="Logo" fill className="rounded-lg" />
      </div>
      <span className="text-white text-2xl font-bold">ANIMAL YAPPING</span>
    </Link>
  );
}
