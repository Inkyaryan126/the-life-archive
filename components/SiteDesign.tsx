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

export function SiteLogo({ className, width = 200, height = 50 }: { className?: string, width?: number, height?: number }) {
  const markSize = Math.min(width, height);
  const wordmarkSize = Math.max(14, Math.min(42, height * 0.42));

  return (
    <span
      className={imageClassName("inline-flex items-center gap-3", className)}
      style={{ minHeight: height }}
    >
      <Image
        src="/images/site-design/book-logo.png"
        alt="The Life Archive book logo"
        width={markSize}
        height={markSize}
        className="h-auto shrink-0"
        priority={height >= 40}
      />
      <span
        className="font-serif leading-none tracking-normal text-archive-ivory"
        style={{ fontSize: wordmarkSize }}
      >
        The Life Archive
      </span>
    </span>
  );
}

export function BookLogo({ className, width = 60, height = 60 }: { className?: string, width?: number, height?: number }) {
  return <Image src="/images/site-design/book-logo.png" alt="The Life Archive book logo" width={width} height={height} className={className} />;
}

export function Monogram({ className, width = 40, height = 40 }: { className?: string, width?: number, height?: number }) {
  return <Image src="/images/site-design/monogram.png" alt="Monogram" width={width} height={height} className={className} />;
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
        className="object-cover object-right opacity-60"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,161,91,0.2),transparent_40rem),radial-gradient(circle_at_bottom_right,rgba(198,161,91,0.08),transparent_40rem),linear-gradient(180deg,rgba(7,7,8,0.1),rgba(7,7,8,0.7))]" />
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
