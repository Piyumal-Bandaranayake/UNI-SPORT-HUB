import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { image, folder } = await req.json();
        if (!image) {
            return NextResponse.json({ error: "Image data is required" }, { status: 400 });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: folder || "unisporthub",
            resource_type: "auto",
        });

        return NextResponse.json({
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
        });
    } catch (err) {
        console.error("Cloudinary upload Error:", err);
        return NextResponse.json({ error: "Failed to upload image to Cloudinary" }, { status: 500 });
    }
}
