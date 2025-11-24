"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface LinkComponentProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export const LinkComponent = ({ href, children, className }: LinkComponentProps) => {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};


