// app/api/admin/agenda/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "../../../../../lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface AgendaEvent {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
}

// GET - Fetch all agenda
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
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

// POST - Create new agenda
export async function POST(request: NextRequest) {
  try {
    console.log("/api/admin/agenda called");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);

    if (!session || !session.user || session.user.role !== "admin") {
      console.log("Unauthorized - not admin");
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);
    
    const { nama, kategori, tanggalMulai, tanggalAkhir } = body;

    // Validation
    if (!nama || !kategori || !tanggalMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "nama, kategori, and tanggalMulai are required",
        },
        { status: 400 }
      );
    }

    const validKategori = [
      "Ujian",
      "Libur",
      "Tanggal Merah",
      "Kegiatan",
    ];
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid kategori value",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal
    const startDate = new Date(tanggalMulai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal mulai tidak boleh sebelum hari ini",
        },
        { status: 400 }
      );
    }

    if (tanggalAkhir) {
      const endDate = new Date(tanggalAkhir);
      if (endDate < startDate) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal akhir tidak boleh sebelum tanggal mulai",
          },
          { status: 400 }
        );
      }
    }

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO agendaCalendar (nama, kategori, tanggalMulai, tanggalAkhir)
       VALUES (?, ?, ?, ?)`,
      [nama, kategori, tanggalMulai, tanggalAkhir || null]
    );

    const agendaId = result.insertId;
    console.log("✅ Agenda created with ID:", agendaId);

    return NextResponse.json({
      success: true,
      message: "Agenda berhasil ditambahkan",
      agenda: {
        id: agendaId,
        nama,
        kategori,
        tanggalMulai,
        tanggalAkhir: tanggalAkhir || null,
      },
    });
  } catch (error) {
    console.error("❌ Error creating agenda:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update agenda
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, nama, kategori, tanggalMulai, tanggalAkhir } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    // Validation
    if (!nama || !kategori || !tanggalMulai) {
      return NextResponse.json(
        {
          success: false,
          message: "nama, kategori, and tanggalMulai are required",
        },
        { status: 400 }
      );
    }

    const validKategori = [
      "Ujian",
      "Libur",
      "Tanggal Merah",
      "Kegiatan",
    ];
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid kategori value",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal
    const startDate = new Date(tanggalMulai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal mulai tidak boleh sebelum hari ini",
        },
        { status: 400 }
      );
    }

    if (tanggalAkhir) {
      const endDate = new Date(tanggalAkhir);
      if (endDate < startDate) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal akhir tidak boleh sebelum tanggal mulai",
          },
          { status: 400 }
        );
      }
    }

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE agendaCalendar 
       SET nama = ?, kategori = ?, tanggalMulai = ?, tanggalAkhir = ?
       WHERE id = ?`,
      [nama, kategori, tanggalMulai, tanggalAkhir || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Agenda not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agenda berhasil diupdate",
      agenda: {
        id,
        nama,
        kategori,
        tanggalMulai,
        tanggalAkhir: tanggalAkhir || null,
      },
    });
  } catch (error) {
    console.error("Error updating agenda:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete agenda
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM agendaCalendar WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Agenda not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agenda berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting agenda:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}