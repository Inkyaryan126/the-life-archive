import { redirect } from "next/navigation";

export default async function ArchiveGrandHallPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/archive/${slug}`);
}
