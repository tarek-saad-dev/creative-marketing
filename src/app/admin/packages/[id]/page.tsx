import { redirect } from "next/navigation";

/** Dedicated package editor route — list dialog remains primary; deep-link to list. */
export default async function AdminPackageDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/packages?edit=${encodeURIComponent(id)}`);
}
