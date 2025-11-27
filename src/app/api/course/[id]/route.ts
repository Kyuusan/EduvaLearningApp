// app/api/course/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkStudentAccess } from "../../../../../lib/course.action";
import { getCourseDetail} from "../../../../../lib/task.action"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parseInt(params.id);
    
    // ✅ Gunakan getCourseDetail dari task.action.ts
    const result = await getCourseDetail(courseId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const course = result.data;

    // ✅ Check access berdasarkan role
    if (session.user.role === "siswa") {
      const hasAccess = await checkStudentAccess(courseId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: "You don't have access to this course" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "guru") {
      // ✅ Cek apakah guru ini yang buat course (compare dengan guruId di users table)
      if (course.guruId !== session.user.id) {
        return NextResponse.json(
          { error: "You don't have access to this course" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "admin") {
      // Admin bisa akses semua course
      // Atau kalau mau strict, uncomment ini:
      // if (course.guruId !== session.user.id) {
      //   return NextResponse.json(
      //     { error: "You don't have access to this course" },
      //     { status: 403 }
      //   );
      // }
    }

    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/course/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}