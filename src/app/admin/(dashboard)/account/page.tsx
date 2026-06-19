import { AdminHeader } from "@/components/admin/sidebar";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Account"
        description={`Signed in as ${session?.user?.email ?? "admin"}.`}
      />
      <ChangePasswordForm />
    </div>
  );
}
