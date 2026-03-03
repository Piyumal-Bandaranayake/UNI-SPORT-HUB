import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          University <span className="text-indigo-600">Sports Hub</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 leading-8">
          The all-in-one platform for managing university sports activities,
          equipment, and tournament schedules. Experience sports like never before.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!session ? (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
              >
                Login to Portal
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-all duration-200"
              >
                Register as Student
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all duration-200"
            >
              Go to My Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 w-full max-w-5xl">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h3 className="text-lg font-semibold text-gray-900">Manage Teams</h3>
          <p className="mt-2 text-gray-600">Coaches can easily manage their teams and training schedules.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h3 className="text-lg font-semibold text-gray-900">Track Progress</h3>
          <p className="mt-2 text-gray-600">Students can track their sports achievements and requests.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
          <h3 className="text-lg font-semibold text-gray-900">Resource Control</h3>
          <p className="mt-2 text-gray-600">Admins have full control over sports categories and users.</p>
        </div>
      </div>
    </div>
  );
}
