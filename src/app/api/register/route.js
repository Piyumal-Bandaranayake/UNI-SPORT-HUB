import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { name, universityId, universityEmail, password, confirmPassword } = await req.json();

        // 1. Validation
        if (!name || !universityId || !universityEmail || !password || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        await dbConnect();

        // 2. Prevent duplicate universityId across ALL user collections
        const models = [Admin, SubAdmin, Coach, Student];
        for (const model of models) {
            const existingUser = await model.findOne({ universityId });
            if (existingUser) {
                return NextResponse.json({ error: "University ID is already registered" }, { status: 400 });
            }
        }

        // 3. Check if university email already exists
        const existingEmail = await Student.findOne({ universityEmail });
        if (existingEmail) {
            return NextResponse.json({ error: "University Email is already registered" }, { status: 400 });
        }

        // 4. Create User
        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            universityId,
            universityEmail,
            passwordHash: hashedPassword,
        });

        await newStudent.save();

        return NextResponse.json({ success: "Student registered successfully" }, { status: 201 });

    } catch (error) {
        console.error("Registration API error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
