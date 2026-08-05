import { redirect } from "next/navigation";

export const metadata = {
  title: "Legacy Question Prologue | The Life Archive",
  robots: {
    index: false,
    follow: false
  }
};

export default async function LegacyProloguePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === "string") {
        urlParams.set(key, val);
      } else if (Array.isArray(val)) {
        for (const v of val) {
          urlParams.append(key, v);
        }
      }
    }
  }

  const queryString = urlParams.toString();
  const destination = queryString ? `/legacy-question?${queryString}` : "/legacy-question";

  redirect(destination);
}
