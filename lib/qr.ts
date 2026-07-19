import QRCode from "qrcode";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function getRequestSiteUrl(host: string | null, protocol = "http") {
  if (host) {
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return getSiteUrl();
}

export function getRandomMemoryUrl(slug: string, siteUrl?: string) {
  const baseUrl = siteUrl || getSiteUrl();
  return `${baseUrl.replace(/\/$/, "")}/archive/${slug}/random`;
}

export async function generateQrSvg(value: string) {
  return QRCode.toString(value, {
    type: "svg",
    margin: 2,
    width: 288,
    color: {
      dark: "#27231f",
      light: "#ffffff"
    }
  });
}

export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
