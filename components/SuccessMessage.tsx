import { TreeBookLogo } from "./SiteDesign";

type SuccessMessageProps = {
  eyebrow: string;
  message: string;
};

export function SuccessMessage({ eyebrow, message }: SuccessMessageProps) {
  return (
    <div className="mb-8 flex items-center gap-5 rounded-[2rem] border border-archive-gold/20 bg-white/[0.03] p-6 shadow-luxury">
      <TreeBookLogo width={40} height={40} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
          {eyebrow}
        </p>
        <p className="mt-2 text-sm leading-6 text-archive-ivory/80">{message}</p>
      </div>
    </div>
  );
}
