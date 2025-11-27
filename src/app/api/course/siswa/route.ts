import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCoursesByStudent } from "../../../../../lib/course.action";

// GET - Ambil course berdasarkan kelas siswa yang di-enroll
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "siswa") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await getCoursesByStudent();
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/course/siswa error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}