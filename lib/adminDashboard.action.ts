"use server";

import db from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

// ==================== TYPES ====================
export interface DashboardStats {
  totalTugas: number;
  totalSiswa: number;
}

export interface AgendaTerdekat {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
  daysUntil: number;
}

// ==================== GET TOTAL TUGAS ====================
/**
 * Mendapatkan total tugas berdasarkan role user:
 * - Guru: hanya tugas yang dia buat
 * - Admin: semua tugas
 */
export async function getTotalTugas(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    let query = "";
    let params: any[] = [];

    if (session.user.role === "guru") {
      // Untuk guru, hitung tugas yang dibuat oleh user tersebut
      query = `
        SELECT COUNT(*) as total
        FROM tugas
        WHERE createdBy = ?
      `;
      params = [session.user.id];
    } else if (session.user.role === "admin") {
      // Untuk admin, hitung semua tugas
      query = `
        SELECT COUNT(*) as total
        FROM tugas
      `;
      params = [];
    } else {
      throw new Error("Only guru and admin can access this data");
    }

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    return rows[0]?.total || 0;
  } catch (error) {
    console.error("Error fetching total tugas:", error);
    return 0;
  }
}

// ==================== GET TOTAL SISWA ====================
/**
 * Mendapatkan total siswa yang bergabung (accses = 'yes')
 */
export async function getTotalSiswa(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "guru" && session.user.role !== "admin") {
      throw new Error("Only guru and admin can access this data");
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM siswa
       WHERE accses = 'yes'`
    );

    return rows[0]?.total || 0;
  } catch (error) {
    console.error("Error fetching total siswa:", error);
    return 0;
  }
}

// ==================== GET DASHBOARD STATS ====================
/**
 * Mendapatkan semua statistik dashboard sekaligus
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [totalTugas, totalSiswa] = await Promise.all([
      getTotalTugas(),
      getTotalSiswa(),
    ]);

    return {
      totalTugas,
      totalSiswa,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalTugas: 0,
      totalSiswa: 0,
    };
  }
}

// ==================== GET AGENDA TERDEKAT ====================
/**
 * Mendapatkan agenda terdekat dari tanggal sekarang
 * Maksimal 5 agenda terdekat
 */
export async function getAgendaTerdekat(): Promise<AgendaTerdekat[]> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        nama,
        kategori,
        tanggalMulai,
        tanggalAkhir,
        DATEDIFF(tanggalMulai, CURDATE()) as daysUntil
      FROM agendaCalendar
      WHERE tanggalMulai >= CURDATE()
      ORDER BY tanggalMulai ASC
      LIMIT 5`
    );

    return rows.map((row) => ({
      id: row.id,
      nama: row.nama,
      kategori: row.kategori,
      tanggalMulai: row.tanggalMulai,
      tanggalAkhir: row.tanggalAkhir,
      daysUntil: row.daysUntil,
    }));
  } catch (error) {
    console.error("Error fetching agenda terdekat:", error);
    return [];
  }
}