import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCoursesByStudent, getKelasByTingkat, getAllKelas } from "../../../../../lib/course.action";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "siswa") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const tingkat = searchParams.get("tingkat") as "X" | "XI" | "XII" | null;

    // Get all kelas for dropdown/popover (jika diperlukan siswa untuk melihat list kelas)
    if (action === "kelas") {
      if (tingkat) {
        const kelas = await getKelasByTingkat(tingkat);
        return NextResponse.json({ success: true, data: kelas });
      }
      const kelas = await getAllKelas();
      return NextResponse.json({ success: true, data: kelas });
    }

    // Get courses by student (default)
    const courses = await getCoursesByStudent();
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/course/siswa error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}