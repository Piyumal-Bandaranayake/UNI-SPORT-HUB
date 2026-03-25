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
        if (userType === "COACH") {
            // Coaches can only have ONE sport
            setSelectedSports([sportName]);
        } else {
            // Sub-Admins can manage MANY sports
            if (selectedSports.includes(sportName)) {
                setSelectedSports(selectedSports.filter(s => s !== sportName));
            } else {
                setSelectedSports([...selectedSports, sportName]);
            }
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
                    email: user.email,
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
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Identity</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{user.name} <span className="text-indigo-600 font-normal">({user.email})</span></p>
        </div>

            {error && <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}
            {success && <div className="p-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded">{success}</div>}

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {allSports.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No sports available. Create some first.</p>
                ) : (
                    allSports.map(sport => (
                        <label key={sport.id || sport._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100 group">
                            <input
                                type={userType === "COACH" ? "radio" : "checkbox"}
                                name="sport-selection"
                                checked={selectedSports.includes(sport.name)}
                                onChange={() => handleToggle(sport.name)}
                                className="w-4 h-4 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{sport.name}</span>
                                {userType === "COACH" && selectedSports.includes(sport.name) && (
                                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">Primary Specialization</span>
                                )}
                            </div>
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
