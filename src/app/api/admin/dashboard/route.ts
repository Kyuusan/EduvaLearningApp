// app/api/dashboard/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "../../../../../lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah user sudah login dan role-nya guru atau admin
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userRole = session.user.role;

    if (userRole !== "guru" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only guru and admin can access this data" },
        { status: 403 }
      );
    }

    // Get total tugas
    let totalTugas = 0;
    if (userRole === "guru") {
      // Untuk guru, hitung tugas yang dibuat oleh user tersebut
      const [tugasRows] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total
         FROM tugas
         WHERE createdBy = ?`,
        [session.user.id]
      );
      totalTugas = tugasRows[0]?.total || 0;
    } else if (userRole === "admin") {
      // Untuk admin, hitung semua tugas
      const [tugasRows] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total
         FROM tugas`
      );
      totalTugas = tugasRows[0]?.total || 0;
    }

    // Get total siswa yang sudah bergabung (accses = 'yes')
    const [siswaRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM siswa
       WHERE accses = 'yes'`
    );
    const totalSiswa = siswaRows[0]?.total || 0;

    return NextResponse.json({
      success: true,
      totalTugas: totalTugas,
      totalSiswa: totalSiswa,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}