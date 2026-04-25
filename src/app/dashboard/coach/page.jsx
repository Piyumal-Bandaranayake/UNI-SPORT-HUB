"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { jsPDF } from "jspdf";

const MENU_ITEMS = [
    { id: "Overview", icon: "", label: "Dashboard" },
    { id: "Departments", icon: "", label: "My Departments" },
    { id: "Schedule", icon: "", label: "Training Schedule" },
    { id: "Exercise", icon: "", label: "Consultations" },
    { id: "Achievements", icon: "", label: "Achievements" },
];

export default function CoachDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [sports, setSports] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [exerciseRequests, setExerciseRequests] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [formData, setFormData] = useState({ sportName: '', date: '', time: '', location: '', activity: '' });
    const [scheduleErrors, setScheduleErrors] = useState({});
    const [achievementData, setAchievementData] = useState({ title: '', description: '', date: '', image: '', sportName: '' });
    const [achievementErrors, setAchievementErrors] = useState({});
    const [achievementStatus, setAchievementStatus] = useState({ error: '', success: '' });
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    // Meeting Link Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [targetRequestId, setTargetRequestId] = useState(null);
    const [targetRequestType, setTargetRequestType] = useState(null);
    const [enteredMeetingLink, setEnteredMeetingLink] = useState("");
    const [meetingLinkError, setMeetingLinkError] = useState("");

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const res = await fetch("/api/user/assigned-sports");
                if (res.ok) {
                    const data = await res.json();
                    setSports(data);
                }
            } catch (err) {
                console.error("Failed to fetch sports:", err);
            }
        };
        const fetchSchedules = async () => {
            try {
                const res = await fetch("/api/user/schedules");
                if (res.ok) {
                    const data = await res.json();
                    setSchedules(data);
                }
            } catch (err) {
                console.error("Failed to fetch schedules:", err);
            }
        };
        const fetchExerciseRequests = async () => {
            try {
                const res = await fetch("/api/user/exercise-requests");
                if (res.ok) {
                    const data = await res.json();
                    setExerciseRequests(data);
                }
            } catch (err) {
                console.error("Failed to fetch exercise requests:", err);
            }
        };
        const fetchAchievements = async () => {
            try {
                const res = await fetch("/api/user/achievements");
                if (res.ok) {
                    const data = await res.json();
                    setAchievements(data);
                }
            } catch (err) {
                console.error("Failed to fetch achievements:", err);
            }
        };
        fetchSports();
        fetchSchedules();
        fetchExerciseRequests();
        fetchAchievements();
    }, []);

    const validateField = (name, value) => {
        let error = "";
        if (!value && name !== 'sportName') {
            error = "Field is required";
        } else if (name === 'date') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                error = "Past dates not allowed";
            }
        } else if (name === 'location' && value.length < 3) {
            error = "Location too short";
        } else if (name === 'activity' && value.length < 5) {
            error = "Activity detail too short";
        }
        setScheduleErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const validateAchievementField = (name, value) => {
        let error = "";
        if (!value) {
            error = "This field is required";
        } else if (name === 'title' && value.length < 5) {
            error = "Title must be at least 5 characters";
        } else if (name === 'description' && value.length < 10) {
            error = "Description must be at least 10 characters";
        }
        setAchievementErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleAchievementInputChange = (e) => {
        const { name, value } = e.target;
        setAchievementData(prev => ({ ...prev, [name]: value }));
        validateAchievementField(name, value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();

        // Final validation check
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });

        if (Object.values(errors).some(error => error !== "")) {
            setScheduleErrors(prev => ({ ...prev, submit: "Please fix all highlighted errors." }));
            return;
        }

        try {
            const res = await fetch("/api/user/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const { scheduleId } = await res.json();
                setSchedules([{ id: scheduleId, ...formData }, ...schedules]);
                setIsModalOpen(false);
                setFormData({ sportName: '', date: '', time: '', location: '', activity: '' });
                setScheduleErrors({});
                setActiveTab("Schedule");
            } else {
                const data = await res.json();
                setScheduleErrors({ submit: data.error || "Failed to create schedule." });
            }
        } catch (err) {
            console.error("Error creating schedule:", err);
            setScheduleErrors({ submit: "A technical error occurred." });
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        try {
            const res = await fetch(`/api/user/schedules/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSchedules(schedules.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error("Error deleting schedule:", err);
        }
    };

    const openMeetingLinkModal = (id, type) => {
        setTargetRequestId(id);
        setTargetRequestType(type);
        setEnteredMeetingLink("");
        setMeetingLinkError("");
        setIsLinkModalOpen(true);
    };

    const handleApproveWithLink = async () => {
        if (!enteredMeetingLink || !enteredMeetingLink.startsWith("http")) {
            setMeetingLinkError("Please enter a valid meeting link starting with http:// or https://");
            return;
        }
        setIsLinkModalOpen(false);
        await handleUpdateRequestStatus(targetRequestId, "ACCEPTED", targetRequestType, "ONLINE", enteredMeetingLink);
    };

    const handleUpdateRequestStatus = async (id, status, type, category, providedLink = "") => {
        let meetingLink = providedLink;

        try {
            const res = await fetch(`/api/user/exercise-requests`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status, type, meetingLink })
            });
            if (res.ok) {
                if (status === "REJECTED") {
                    setExerciseRequests(exerciseRequests.filter(req => req.id !== id));
                } else {
                    setExerciseRequests(exerciseRequests.map(req => req.id === id ? { ...req, status, meetingLink } : req));
                }
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update request");
            }
        } catch (err) {
            console.error(`Error updating request ${id}:`, err);
            alert("An error occurred while updating the request.");
        }
    };

    const handleDeleteApprovedRequest = async (id, type) => {
        if (!confirm("Are you sure you want to remove this approved schedule?")) return;
        try {
            const res = await fetch(`/api/user/exercise-requests`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, type })
            });
            if (res.ok) {
                setExerciseRequests(prev => prev.filter(req => req.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete schedule");
            }
        } catch (err) {
            console.error("Error deleting approved request:", err);
            alert("An error occurred while deleting.");
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(17, 24, 39); // Gray-900
        doc.text("Approved Schedules Report", 14, 25);
        
        // Add Date
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray-400
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
        
        // Add Horizontal Line
        doc.setDrawColor(229, 231, 235); // Gray-200
        doc.setLineWidth(0.5);
        doc.line(14, 38, 196, 38);
        
        let yPos = 50;
        
        if (approvedRequests.length === 0) {
            doc.setFontSize(12);
            doc.text("No approved schedules found.", 14, yPos);
        } else {
            approvedRequests.forEach((req, index) => {
                // Check if we need a new page
                if (yPos > 260) {
                    doc.addPage();
                    yPos = 25;
                }
                
                // Student Name
                doc.setFontSize(14);
                doc.setTextColor(17, 24, 39);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. ${req.studentName}`, 14, yPos);
                
                yPos += 8;
                
                // Details
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(55, 65, 81); // Gray-700
                
                doc.text(`Type: ${req.type}`, 14, yPos);
                doc.text(`Category: ${req.category}`, 80, yPos);
                yPos += 6;
                
                doc.text(`Date: ${new Date(req.createdAt).toLocaleDateString()}`, 14, yPos);
                doc.text(`Contact: ${req.contactNumber}`, 80, yPos);
                yPos += 6;
                
                if (req.meetingLink) {
                    doc.setTextColor(5, 150, 105); // Emerald-600
                    doc.text(`Meeting Link: ${req.meetingLink}`, 14, yPos);
                    doc.setTextColor(55, 65, 81);
                    yPos += 6;
                }
                
                // Detail text with wrapping
                doc.setFont("helvetica", "italic");
                const splitDetail = doc.splitTextToSize(`Detail: "${req.detail}"`, 170);
                doc.text(splitDetail, 14, yPos);
                
                yPos += (splitDetail.length * 5) + 12;
                
                // Divider
                doc.setDrawColor(243, 244, 246); // Gray-50
                doc.line(14, yPos - 6, 196, yPos - 6);
            });
        }
        
        doc.save("Approved_Schedules_Report.pdf");
    };

    const pendingRequests = exerciseRequests.filter(req => req.status === "PENDING");
    const approvedRequests = exerciseRequests.filter(req => req.status === "ACCEPTED");

    const uploadToCloudinary = async (base64Image) => {
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image, folder: "achievements" }),
            });
            const data = await res.json();
            if (res.ok) return data.url;
            throw new Error(data.error || "Upload failed");
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            throw err;
        }
    };

    const handleCreateAchievement = async (e) => {
        e.preventDefault();
        setAchievementStatus({ error: '', success: '' });

        // Final validation check
        const errors = {};
        Object.keys(achievementData).forEach(key => {
            const error = validateAchievementField(key, achievementData[key]);
            if (error) errors[key] = error;
        });

        if (Object.values(errors).some(error => error !== "")) {
            setAchievementStatus({ ...achievementStatus, error: "Please fix the errors before submitting." });
            return;
        }

        if (!achievementData.image) {
            setAchievementErrors(prev => ({ ...prev, image: "Please upload an image" }));
            setAchievementStatus({ ...achievementStatus, error: "Please upload an image." });
            return;
        }

        setUploading(true);
        try {
            let imageUrl = achievementData.image;
            if (imageUrl && imageUrl.startsWith("data:image")) {
                imageUrl = await uploadToCloudinary(imageUrl);
            }

            const res = await fetch("/api/user/achievements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...achievementData, image: imageUrl })
            });

            const data = await res.json();
            if (res.ok) {
                setAchievements([{ id: data.achievementId, ...achievementData, image: imageUrl }, ...achievements]);
                setIsAchievementModalOpen(false);
                setAchievementData({ title: '', description: '', date: '', image: '', sportName: '' });
                setAchievementStatus({ error: '', success: 'Achievement published successfully!' });
            } else {
                throw new Error(data.error || "Failed to publish achievement");
            }
        } catch (err) {
            console.error("Error creating achievement:", err);
            setAchievementStatus({ ...achievementStatus, error: err.message || "A technical error occurred while publishing." });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAchievement = async (id) => {
        if (!confirm("Remove this achievement?")) return;
        try {
            const res = await fetch(`/api/user/achievements/${id}`, { method: "DELETE" });
            if (res.ok) {
                setAchievements(prev => prev.filter(a => a.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete achievement");
            }
        } catch (err) {
            console.error("Error deleting achievement:", err);
            alert("An error occurred while deleting the achievement.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-emerald-50 border-r border-emerald-100 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-emerald-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1">
                    <div className="bg-emerald-50 px-4 py-3 rounded-2xl mb-8 border border-emerald-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Role</span>
                        <span className="text-sm font-black text-gray-900">Official Coach</span>
                    </div>

                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-emerald-100 bg-white/50 backdrop-blur-md space-y-3">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-emerald-900/60 hover:bg-emerald-100/50 hover:text-emerald-900 transition-all"
                    >
                        Back to Home
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Top Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{MENU_ITEMS.find(m => m.id === activeTab)?.label || activeTab}</h1>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Generate notifications on the fly from pending requests */}
                    {(() => {
                        const notifications = exerciseRequests
                            .filter(req => req.status === "PENDING")
                            .map(req => ({
                                id: req.id,
                                type: req.type || "CONSULTATION",
                                title: "New Session Request",
                                message: `${req.studentName} requested an ${req.type} session.`,
                                time: req.createdAt
                            }))
                            .sort((a, b) => new Date(b.time) - new Date(a.time));

                        return (
                            <div className="flex items-center gap-6 relative">
                                <button
                                    onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                                    className="text-gray-400 hover:text-gray-900 transition-colors relative"
                                >
                                    🔔
                                    {notifications.length > 0 && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>

                                {/* Notification Panel */}
                                {isNotificationPanelOpen && (
                                    <div className="absolute top-10 right-[30%] w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Notifications</h4>
                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full uppercase">{notifications.length} New</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <div className="text-2xl mb-2">🎈</div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No new updates</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{notif.type}</span>
                                                            <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(notif.time).toLocaleDateString()}</span>
                                                        </div>
                                                        <h5 className="text-[11px] font-black text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{notif.title}</h5>
                                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">"{notif.message}"</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-600">
                                        {session?.user?.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Coach {session?.user?.name?.split(' ')[0]}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">Head of Coaching</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </header>

                {/* Greeting Banner */}
                {activeTab === "Overview" && (
                    <div className="relative mb-10 overflow-hidden rounded-[32px] bg-emerald-600 p-10 shadow-2xl shadow-emerald-100">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-4xl font-black text-white leading-tight">
                                    Coach {session?.user?.name?.split(' ')[0]}
                                </h2>
                                <p className="mt-4 text-emerald-100 font-medium">
                                    Excellence is not an act, but a habit. Ready to lead your teams to victory today?
                                </p>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-56 h-40 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center">
                                    <span className="text-6xl">🏃</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Content */}
                <div className="space-y-10">
                    {activeTab === "Overview" && (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <StatCard label="My Departments" value={sports.length} color="text-emerald-700" bg="bg-[#ECFDF5]" icon="🏸" subText="Managed teams" />
                                <StatCard label="Achievements" value={achievements.length} color="text-sky-700" bg="bg-[#F0F9FF]" icon="🏆" subText="Success stories" />
                                <StatCard label="Logged Hours" value="0" color="text-amber-700" bg="bg-[#FFFBEB]" icon="📅" subText="This month" />
                            </div>

                            <div className="mt-12">
                                <h3 className="text-lg font-black text-gray-900 mb-8">Quick Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sports.map((sport) => (
                                        <div key={sport.id} className="bg-white p-6 rounded-[28px] flex items-center justify-between shadow-sm border border-gray-50 group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl">
                                                    {sport.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 uppercase tracking-tight">{sport.name}</h4>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Active Season</span>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">• Management</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/sports/${sport.id}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all">
                                                →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Departments" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sports.map((sport) => (
                                <div key={sport.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all group">
                                    <div className="h-40 bg-emerald-600 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                                        <div className="absolute bottom-4 left-6 z-10">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{sport.name}</h3>
                                            <span className="text-[10px] font-black bg-white/20 text-white px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Official</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Athletes</div>
                                                <div className="text-gray-900 font-bold">-- Registered</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                                                <div className="text-emerald-600 font-bold">Active</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setFormData({ ...formData, sportName: sport.name });
                                                    setScheduleErrors({});
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all">
                                                Create Schedule
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("Schedule")}
                                                className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all">
                                                Edit schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "Schedule" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Training Schedule</h3>
                            {schedules.length === 0 ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">📅</div>
                                    <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">No upcoming sessions scheduled for this week.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {schedules.map((schedule) => (
                                        <div key={schedule.id} className="p-6 rounded-[24px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">{schedule.sportName}</span>
                                                    <span className="text-sm font-bold text-gray-900">{schedule.date} at {schedule.time}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">{schedule.activity}</p>
                                                <p className="text-xs font-medium text-gray-400 mt-1">📍 {schedule.location}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Exercise" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Pending Requests Section */}
                            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Incoming Requests</h3>
                                        <p className="text-xs text-gray-400 font-medium">Manage student consultations and plan adjustments.</p>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        {pendingRequests.length} Pending
                                    </div>
                                </div>
                                {/* Pending requests mapping */}
                                {pendingRequests.length === 0 ? (
                                    <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">📩</div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Inbox is clear</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingRequests.map((req) => (
                                            <div key={req.id} className="p-7 rounded-[32px] border border-gray-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:shadow-emerald-100/20 transition-all border-l-4 border-l-emerald-600 group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${req.type === "SESSION" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-sky-50 text-sky-600 border-sky-100"
                                                            }`}>
                                                            {req.type} • {req.category}
                                                        </span>
                                                        <span className="text-[10px] text-gray-300 font-bold tracking-tighter">— {new Date(req.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-black text-gray-900 mb-1">{req.studentName}</h4>
                                                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{req.detail}"</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                            <span>📞</span> {req.contactNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            if (req.category === "ONLINE") {
                                                                openMeetingLinkModal(req.id, req.type);
                                                            } else {
                                                                handleUpdateRequestStatus(req.id, "ACCEPTED", req.type, req.category);
                                                            }
                                                        }}
                                                        className="flex-1 lg:flex-none px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-gray-200"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRequestStatus(req.id, "REJECTED", req.type, req.category)}
                                                        className="flex-1 lg:flex-none px-8 py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Approved Schedules Section */}
                            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Approved Schedules</h3>
                                        <p className="text-xs text-gray-400 font-medium">Your upcoming confirmed sessions and plans.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {approvedRequests.length > 0 && (
                                            <button
                                                onClick={downloadPDF}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                📥 Download PDF
                                            </button>
                                        )}
                                        <div className="bg-sky-50 text-sky-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100">
                                            {approvedRequests.length} Approved
                                        </div>
                                    </div>
                                </div>
                                {/* Approved requests mapping */}
                                {approvedRequests.length === 0 ? (
                                    <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-sky-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">✅</div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No approved schedules yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {approvedRequests.map((req) => (
                                            <div key={req.id} className="p-7 rounded-[32px] border border-gray-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:shadow-sky-100/20 transition-all border-l-4 border-l-sky-500 group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${req.type === "SESSION" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-sky-50 text-sky-600 border-sky-100"
                                                            }`}>
                                                            {req.type} • {req.category}
                                                        </span>
                                                        <span className="text-[10px] text-gray-300 font-bold tracking-tighter">— {new Date(req.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-black text-gray-900 mb-1">{req.studentName}</h4>
                                                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{req.detail}"</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                            <span>📞</span> {req.contactNumber}
                                                        </div>
                                                        {req.meetingLink && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded-md">
                                                                <span>🔗</span> <a href={req.meetingLink} target="_blank" rel="noreferrer" className="hover:underline">Join Session</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteApprovedRequest(req.id, req.type)}
                                                    className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shrink-0"
                                                    title="Remove this schedule"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "Achievements" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-gray-900 underline decoration-sky-200 underline-offset-8 decoration-4 uppercase tracking-tight">Achievements & Glory</h3>
                                <button
                                    onClick={() => setIsAchievementModalOpen(true)}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg"
                                >
                                    + Add Achievement
                                </button>
                            </div>

                            {achievements.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="text-5xl mb-6">🏆</div>
                                    <p className="text-gray-400 font-bold">No achievements recorded yet. Showcase your wins!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {achievements.map((ach) => (
                                        <div key={ach.id} className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                            <div className="h-40 overflow-hidden relative">
                                                <img src={ach.image} alt="Achievement" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button
                                                        onClick={() => handleDeleteAchievement(ach.id)}
                                                        className="w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-all text-sm border border-rose-200"
                                                        title="Delete Achievement"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">{ach.sportName}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{ach.date}</span>
                                                </div>
                                                <h4 className="font-black text-gray-900 mb-2 truncate">{ach.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 italic">"{ach.description}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl m-4 border border-gray-100 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Create Schedule</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">✕</button>
                            </div>

                            {scheduleErrors.submit && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                                    <span>⚠️</span> {scheduleErrors.submit}
                                </div>
                            )}

                            <form onSubmit={handleCreateSchedule} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Sport</label>
                                    <input
                                        type="text"
                                        name="sportName"
                                        readOnly
                                        value={formData.sportName}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                                            {scheduleErrors.date && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {scheduleErrors.date}</span>}
                                        </div>
                                        <input
                                            type="date"
                                            required
                                            name="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none transition-all ${scheduleErrors.date ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"
                                                }`}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                                            {scheduleErrors.time && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {scheduleErrors.time}</span>}
                                        </div>
                                        <input
                                            type="time"
                                            required
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none transition-all ${scheduleErrors.time ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"
                                                }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                                        {scheduleErrors.location && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {scheduleErrors.location}</span>}
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        name="location"
                                        placeholder="e.g. Main Stadium"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none transition-all ${scheduleErrors.location ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"
                                            }`}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</label>
                                        {scheduleErrors.activity && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {scheduleErrors.activity}</span>}
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        name="activity"
                                        placeholder="e.g. Endurance Training"
                                        value={formData.activity}
                                        onChange={handleInputChange}
                                        className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none transition-all ${scheduleErrors.activity ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"
                                            }`}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4 mt-8 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                                        Create Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Achievement Modal */}
                {isAchievementModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] p-10 max-w-3xl w-full shadow-2xl m-4 border border-gray-100 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Publish Success</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Share your team's achievement with the world.</p>
                                </div>
                                <button onClick={() => {
                                    setIsAchievementModalOpen(false);
                                    setAchievementStatus({ error: '', success: '' });
                                }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">✕</button>
                            </div>

                            {achievementStatus.error && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                                    <span>⚠️</span> {achievementStatus.error}
                                </div>
                            )}

                            <form onSubmit={handleCreateAchievement}>
                                {/* Two-column horizontal layout */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Left column — text fields */}
                                    <div className="space-y-4">
                                        {/* Sport + Date row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sport Department</label>
                                                    {achievementErrors.sportName && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {achievementErrors.sportName}</span>}
                                                </div>
                                                <select
                                                    required
                                                    name="sportName"
                                                    value={achievementData.sportName}
                                                    onChange={handleAchievementInputChange}
                                                    className={`w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all ${achievementErrors.sportName ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"}`}
                                                >
                                                    <option value="">Select Sport</option>
                                                    {sports.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Achieved</label>
                                                    {achievementErrors.date && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {achievementErrors.date}</span>}
                                                </div>
                                                <input
                                                    type="date" required
                                                    name="date"
                                                    value={achievementData.date}
                                                    onChange={handleAchievementInputChange}
                                                    className={`w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all ${achievementErrors.date ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="flex flex-col">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Achievement Title</label>
                                                {achievementErrors.title && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {achievementErrors.title}</span>}
                                            </div>
                                            <input
                                                type="text" required
                                                name="title"
                                                placeholder="e.g. SLUG 2026 Gold Medal"
                                                value={achievementData.title}
                                                onChange={handleAchievementInputChange}
                                                className={`w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all ${achievementErrors.title ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"}`}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Short Description</label>
                                                {achievementErrors.description && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {achievementErrors.description}</span>}
                                            </div>
                                            <textarea
                                                required rows={5}
                                                name="description"
                                                placeholder="Tell us more about this win..."
                                                value={achievementData.description}
                                                onChange={handleAchievementInputChange}
                                                className={`w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all resize-none ${achievementErrors.description ? "ring-2 ring-rose-500/20 bg-rose-50/10" : "focus:ring-2 ring-emerald-50"}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Right column — image upload */}
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trophy / Team Photo</label>
                                            {achievementErrors.image && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">● {achievementErrors.image}</span>}
                                        </div>
                                        <div className={`relative flex-1 min-h-[220px] bg-gray-50 rounded-[20px] border-2 border-dashed flex items-center justify-center overflow-hidden hover:border-emerald-300 transition-all cursor-pointer ${achievementErrors.image ? "border-rose-200 ring-2 ring-rose-500/20 bg-rose-50/10" : "border-gray-200"}`}>
                                            {achievementData.image ? (
                                                <>
                                                    <img src={achievementData.image} className="w-full h-full object-cover" alt="Preview" />
                                                    <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-[9px] font-black text-gray-600 uppercase px-2 py-1 rounded-lg">Click to change</div>
                                                </>
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="text-4xl mb-3">📸</div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Upload Media</span>
                                                    <span className="text-[9px] font-medium text-gray-300 mt-1 block">PNG, JPG, WEBP supported</span>
                                                </div>
                                            )}
                                            <input
                                                type="file" required accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setAchievementData({ ...achievementData, image: reader.result });
                                                            setAchievementErrors(prev => ({ ...prev, image: "" }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-6 mt-6 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setIsAchievementModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-400 hover:bg-gray-50 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-[3] bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {uploading ? "Publishing Media..." : "Share Achievement"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Meeting Link Modal */}
                {isLinkModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Meeting Link</h2>
                                <button onClick={() => setIsLinkModalOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">✕</button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Enter online session link</label>
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        value={enteredMeetingLink}
                                        onChange={(e) => setEnteredMeetingLink(e.target.value)}
                                        className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${meetingLinkError ? 'ring-2 ring-rose-500' : 'ring-indigo-50'}`}
                                        autoFocus
                                    />
                                    {meetingLinkError && <p className="mt-2 text-[10px] font-bold text-rose-500">{meetingLinkError}</p>}
                                </div>
                                <button
                                    onClick={handleApproveWithLink}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                                >
                                    Approve Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, value, color, bg, icon, subText }) {
    return (
        <div className={`rounded-[28px] ${bg} p-7 flex flex-col gap-4 shadow-sm border border-gray-50 transition-transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">{icon}</div>
                <div className={`text-3xl font-black ${color}`}>{value}</div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase">{subText}</p>
            </div>
        </div>
    );
}

