import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCoursesByCreator,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllKelas,
  getKelasByTingkat,
  CreateCourseInput,
  UpdateCourseInput,
} from "../../../../../lib/course.action";

// GET - Ambil courses atau kelas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const tingkat = searchParams.get("tingkat") as "X" | "XI" | "XII" | null;

    // Get all kelas for dropdown
    if (action === "kelas") {
      if (tingkat) {
        const kelas = await getKelasByTingkat(tingkat);
        return NextResponse.json({ success: true, data: kelas });
      }
      const kelas = await getAllKelas();
      return NextResponse.json({ success: true, data: kelas });
    }

    // Get courses by creator (default)
    const courses = await getCoursesByCreator();
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("GET /api/course/guru error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create course baru
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCourseInput = await req.json();
    
    // LOG BODY
    console.log('Received body:', body);
    console.log('Session user:', session.user);

    if (!body.nama || !body.kelasIds || body.kelasIds.length === 0) {
      return NextResponse.json(
        { error: "Nama dan kelas harus diisi" },
        { status: 400 }
      );
    }

    const newCourse = await createCourse(body);
    return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/course/guru error:", error);
    // LOG ERROR DETAIL
    console.error("Error stack:", error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update course
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateCourseInput = await req.json();

    if (!body.id || !body.nama || !body.kelasIds || body.kelasIds.length === 0) {
      return NextResponse.json(
        { error: "ID, nama, dan kelas harus diisi" },
        { status: 400 }
      );
    }

    const updatedCourse = await updateCourse(body);
    return NextResponse.json({ success: true, data: updatedCourse }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/course/guru error:", error);
    
    if (error.message.includes("not found") || error.message.includes("permission")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Hapus course
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    await deleteCourse(parseInt(id));
    return NextResponse.json({ success: true, message: "Course deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/course/guru error:", error);
    
    if (error.message.includes("not found") || error.message.includes("permission")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}