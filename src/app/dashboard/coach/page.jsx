import { auth } from "@/auth";

export default async function CoachDashboard() {
    const session = await auth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="mt-4 text-lg text-gray-600">Welcome, <span className="font-semibold text-emerald-600">{session.user.name}</span>! ({session.user.universityId})</p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Assigned Sports</h3>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Manage team members</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">New Requests</h3>
                    <p className="mt-2 text-2xl font-bold text-amber-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Review student applications</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Training Hours</h3>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Total hours this week</p>
                </div>
            </div>
        </div>
    );
}
