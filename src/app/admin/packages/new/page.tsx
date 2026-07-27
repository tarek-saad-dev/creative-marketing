import { redirect } from "next/navigation";

export default async function AdminPackageNewRedirect() {
  redirect("/admin/packages?new=1");
}
