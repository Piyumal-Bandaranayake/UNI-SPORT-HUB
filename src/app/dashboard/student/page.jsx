import { auth } from "@/auth";

export default async function StudentDashboard() {
    const session = await auth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-4 text-lg text-gray-600">Welcome, <span className="font-semibold text-indigo-600">{session.user.name}</span>! ({session.user.universityId})</p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Approved Sports</h3>
                    <p className="mt-2 text-2xl font-bold text-indigo-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Join sports through requests</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Pending Requests</h3>
                    <p className="mt-2 text-2xl font-bold text-amber-600">0</p>
                    <p className="text-sm text-gray-500 mt-1">Wait for coach approval</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">Next Training</h3>
                    <p className="mt-2 text-gray-600 italic">No scheduled sessions</p>
                </div>
            </div>
        </div>
    );
}
