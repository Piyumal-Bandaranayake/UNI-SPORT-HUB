import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="rounded-xl bg-white p-12 shadow-md">
                <h1 className="text-4xl font-bold text-red-600">403 - Forbidden</h1>
                <p className="mt-4 text-lg text-gray-700">You do not have permission to access this page.</p>
                <div className="mt-8">
                    <Link
                        href="/dashboard"
                        className="rounded-md bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
                    >
                        Go to My Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
