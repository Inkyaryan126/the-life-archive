import Image from "next/image";
import Link from "next/link";

type DesignBackdropProps = {
  className?: string;
};

type DesignButtonImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  sizes?: string;
  priority?: boolean;
};

type DesignImageButtonLinkProps = {
  href: string;
  label: string;
  className?: string;
  images: DesignButtonImage[];
};

function imageClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function DesignBackdrop({ className }: DesignBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={imageClassName(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <Image
        src="/images/site-design/tla-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-40"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.24),transparent_34rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.1),transparent_32rem),linear-gradient(180deg,rgba(7,7,8,0.14),rgba(7,7,8,0.86))]" />
    </div>
  );
}

export function DesignImageButtonLink({
  href,
  label,
  className,
  images
}: DesignImageButtonLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={imageClassName(
        "group block focus:outline-none focus:ring-4 focus:ring-archive-gold/30",
        className
      )}
    >
      <span className="sr-only">{label}</span>
      <div className="overflow-hidden rounded-[1.45rem] transition-transform duration-200 group-hover:scale-[1.02]">
        {images.map((image) => (
          <Image
            key={`${image.src}-${image.className}`}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={image.priority}
            sizes={image.sizes || "(min-width: 1280px) 18rem, (min-width: 640px) 33vw, 50vw"}
            className={imageClassName("h-auto w-full", image.className)}
          />
        ))}
      </div>
    </Link>
  );
}
