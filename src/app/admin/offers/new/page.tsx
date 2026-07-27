import { redirect } from "next/navigation";

export default async function AdminOfferNewRedirect() {
  redirect("/admin/offers?new=1");
}
