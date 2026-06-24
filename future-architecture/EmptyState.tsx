import React from "react";
import { BookLogo } from "./SiteDesign";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({
  eyebrow = "Their story is waiting",
  title,
  message,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-[2rem] border border-archive-gold/22 bg-archive-obsidian p-8 sm:p-10 shadow-luxury max-w-2xl mx-auto my-6">
      <BookLogo width={64} height={64} className="mb-6 opacity-90" />
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold mb-3">
          {eyebrow}
        </p>
      )}
      <h3 className="font-serif text-2xl sm:text-3xl text-archive-ivory leading-tight mb-4">
        {title}
      </h3>
      <p className="text-sm leading-7 text-archive-ivory/68 max-w-md mb-6">
        {message}
      </p>
      {action && <div className="mt-2 flex justify-center">{action}</div>}
    </div>
  );
}
