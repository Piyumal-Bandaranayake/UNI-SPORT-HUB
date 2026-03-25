import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendStudentWelcome } from "@/lib/mail";

export async function POST(req) {
    try {
        const { name, universityId, universityEmail, password, confirmPassword, faculty } = await req.json();

        // 1. Validation
        const validFaculties = ["IT", "BM", "ENG", "HM", "AR", "HU",];

        if (!name || !universityId || !universityEmail || !password || !confirmPassword || !faculty) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // 1.1 Universal Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(universityEmail)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        if (!validFaculties.includes(faculty)) {
            return NextResponse.json({ error: "Invalid faculty selected" }, { status: 400 });
        }

        // Validate that universityId starts with the selected faculty code + exactly 8 digits
        const idPattern = new RegExp(`^${faculty}\\d{8}$`);
        if (!idPattern.test(universityId)) {
            return NextResponse.json({
                error: `Registration number must start with "${faculty}" followed by exactly 8 digits (e.g. ${faculty}12345678)`
            }, { status: 400 });
        }

        // Validate that university email matches registrationNumber@my.sliit.lk
        const expectedEmail = `${universityId}@my.sliit.lk`;
        if (universityEmail !== expectedEmail) {
            return NextResponse.json({
                error: `University email must be "${expectedEmail}"`
            }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return NextResponse.json({
                error: "Password is too weak. Must be at least 8 characters and include uppercase, lowercase, numbers, and special characters (@$!%*?&)."
            }, { status: 400 });
        }

        await dbConnect();

        // 2. Comprehensive Cross-Role Uniqueness Check
        const trimmedId = universityId.trim();
        const trimmedEmail = universityEmail.trim();

        const checks = [
            { model: Admin, field: "universityId", value: trimmedId },
            { model: SubAdmin, field: "email", value: trimmedEmail },
            { model: Coach, field: "email", value: trimmedEmail },
            { model: Student, field: "universityId", value: trimmedId },
            { model: Student, field: "universityEmail", value: trimmedEmail }
        ];

        for (const { model, field, value } of checks) {
            const existing = await model.findOne({
                [field]: { $regex: new RegExp("^" + value + "$", "i") }
            });
            if (existing) {
                return NextResponse.json({
                    error: "This Identity (ID or Email) is already taken. Please try logging in."
                }, { status: 400 });
            }
        }

        // 4. Create User
        const hashedPassword = await bcrypt.hash(password, 10);

        // Proactive Dispatch: Verify email delivery before final creation
        const emailStatus = await sendStudentWelcome(trimmedEmail, name, trimmedId);
        
        if (!emailStatus.success) {
            return NextResponse.json({ 
                error: "Your email is not valid. Please enter a correct email address to continue." 
            }, { status: 400 });
        }

        const newStudent = new Student({
            name,
            universityId: trimmedId,
            universityEmail: trimmedEmail,
            passwordHash: hashedPassword,
            faculty,
        });

        await newStudent.save();

        return NextResponse.json({ success: "Student registered successfully. Welcome email sent!" }, { status: 201 });

    } catch (error) {
        console.error("Registration API error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
