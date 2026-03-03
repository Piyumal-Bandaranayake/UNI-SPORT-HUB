import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRoot() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const role = session.user.role.toLowerCase().replace(/_/g, '-');
    redirect(`/dashboard/${role}`);
}
