import { auth } from "@/auth";

export default async function SubAdminDashboard() {
    const session = await auth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Sub-Admin Dashboard</h1>
            <p className="mt-4 text-lg text-gray-600">Welcome, <span className="font-semibold text-sky-600">{session.user.name}</span>! ({session.user.universityId})</p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Managed Sports</h3>
                    <p className="mt-2 text-2xl font-bold text-sky-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Specific sport management</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Equipment Status</h3>
                    <p className="mt-2 text-2xl font-semibold text-amber-600">Pending Update</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Tournament Schedule</h3>
                    <p className="mt-2 text-sm text-gray-600 italic">No upcoming tournaments</p>
                </div>
            </div>
        </div>
    );
}
