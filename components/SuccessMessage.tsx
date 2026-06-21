type SuccessMessageProps = {
  eyebrow: string;
  message: string;
};

export function SuccessMessage({ eyebrow, message }: SuccessMessageProps) {
  return (
    <div className="mb-8 flex items-start gap-4 border-l-2 border-archive-gold pl-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
          {eyebrow}
        </p>
        <p className="mt-1 text-sm leading-6 text-inherit/75">{message}</p>
      </div>
    </div>
  );
}
