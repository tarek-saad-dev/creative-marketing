import { redirect } from "next/navigation";

export default async function AdminOfferDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/offers?edit=${encodeURIComponent(id)}`);
}
