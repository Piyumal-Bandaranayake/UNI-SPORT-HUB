"use client";

import { useState, useEffect } from "react";

export default function AssignSportForm({ user, userType, allSports, onSuccess }) {
    // Determine existing sports based on user type
    const existingSports = userType === "SUB_ADMIN" ? (user.managedSports || []) : (user.assignedSports || []);

    const [selectedSports, setSelectedSports] = useState(existingSports);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleToggle = (sportName) => {
        if (selectedSports.includes(sportName)) {
            setSelectedSports(selectedSports.filter(s => s !== sportName));
        } else {
            setSelectedSports([...selectedSports, sportName]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/admin/assign-sport", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: userType,
                    universityId: user.universityId,
                    sports: selectedSports
                })
            });

            const result = await response.json();
            if (response.ok) {
                setSuccess("Sports updated successfully!");
                if (onSuccess) onSuccess();
            } else {
                setError(result.error || "Failed to assign sports");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
                <p className="text-sm text-gray-600">Assign sports to <span className="font-semibold">{user.name}</span> ({user.universityId})</p>
            </div>

            {error && <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}
            {success && <div className="p-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded">{success}</div>}

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {allSports.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No sports available. Create some first.</p>
                ) : (
                    allSports.map(sport => (
                        <label key={sport.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedSports.includes(sport.name)}
                                onChange={() => handleToggle(sport.name)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{sport.name}</span>
                        </label>
                    ))
                )}
            </div>

            <button
                type="submit"
                disabled={loading || allSports.length === 0}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {loading ? "Saving..." : "Save Assignments"}
            </button>
        </form>
    );
}
