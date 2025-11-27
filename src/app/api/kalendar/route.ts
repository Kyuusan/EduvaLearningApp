// app/api/kalendar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "../../../../lib/db";
import { RowDataPacket } from "mysql2/promise";

// GET - Fetch all agenda (untuk semua user yang sudah login)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah user sudah login (semua role bisa akses)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        nama,
        kategori,
        tanggalMulai,
        tanggalAkhir
      FROM agendaCalendar
      ORDER BY tanggalMulai ASC`
    );

    const agendas = rows.map((row) => ({
      id: row.id,
      nama: row.nama,
      kategori: row.kategori,
      tanggalMulai: row.tanggalMulai,
      tanggalAkhir: row.tanggalAkhir,
    }));

    return NextResponse.json({
      success: true,
      agendas: agendas,
    });
  } catch (error) {
    console.error("Error fetching agendas:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}