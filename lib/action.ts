"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import db from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

import { 
  verifyPasswordWithSync, 
  updatePasswordEverywhere 
} from "./syncPassword";


export interface User extends RowDataPacket {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: "siswa" | "guru" | "admin";
  createdAt: Date;
}

export interface Siswa extends RowDataPacket {
  id: number;
  userId: number;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: "RPL" | "TJKT" | "PSPT" | "ANIM";
  email: string;
  password: string;
  accses: "yes" | "no";
  createdAt: Date;
}

export interface Guru extends RowDataPacket {
  guruId: number;
  userId: number;
  nama: string;
  email: string;
  password: string;
}

export interface Admin extends RowDataPacket {
  id: number;
  userId: number;
  nama: string;
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
  userId?: number;
}

export interface Agenda {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
}



export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await db.query<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getUserByEmail:", error);
    return null;
  }
}

export async function getSiswaByUserId(userId: number): Promise<Siswa | null> {
  try {
    const [rows] = await db.query<Siswa[]>(
      "SELECT * FROM siswa WHERE userId = ?",
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getSiswaByUserId:", error);
    return null;
  }
}

export async function getGuruByUserId(userId: number): Promise<Guru | null> {
  try {
    const [rows] = await db.query<Guru[]>(
      "SELECT * FROM guru WHERE userId = ?",
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getGuruByUserId:", error);
    return null;
  }
}

export async function getAdminByUserId(userId: number): Promise<Admin | null> {
  try {
    const [rows] = await db.query<Admin[]>(
      "SELECT * FROM admin WHERE userId = ?",
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getAdminByUserId:", error);
    return null;
  }
}

export async function updateGuruPassword(guruId: number, hashedPassword: string) {
  try {
    console.log("Updating guru password in database...");
    console.log("guruId:", guruId);
    console.log("hash:", hashedPassword.substring(0, 30) + "...");
    
    const [result] = await db.execute(
      "UPDATE guru SET password = ? WHERE guruId = ?",
      [hashedPassword, guruId]
    );
    
    console.log("Database updated");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}

export async function updateAdminPassword(adminId: number, hashedPassword: string) {
  try {
    console.log("Updating admin password in database...");
    console.log("adminId:", adminId);
    console.log("hash:", hashedPassword.substring(0, 30) + "...");
    
    const [result] = await db.execute(
      "UPDATE admin SET password = ? WHERE id = ?",
      [hashedPassword, adminId]
    );
    
    console.log("Database updated");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}

export async function registerSiswa(data: {
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  email: string;
}): Promise<void> {
  const { nisn, nama, kelas, jurusan, email } = data;

  console.log("Starting registration:", { nisn, nama, email });

  // Validasi input
  if (!nisn || !nama || !kelas || !jurusan || !email) {
    throw new Error("Semua field harus diisi");
  }

  if (nisn.length !== 9) {
    throw new Error("NISN harus 9 digit");
  }

  // Validasi email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Format email tidak valid");
  }

  // Cek email sudah terdaftar
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = bcrypt.hashSync("SMK1234", 10);

  let connection;

  try {
    // Get connection untuk transaction
    connection = await db.getConnection();
    console.log("Database connection acquired");

    await connection.beginTransaction();
    console.log("Transaction started");

    // === LOGIC KELAS: Cek atau buat kelas baru ===
    let kelasId: number;
    
    // 1. Cek apakah kelas sudah ada
    const [existingKelas] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM kelas WHERE nama = ?",
      [kelas]
    );

    if (existingKelas.length > 0) {
      // Kelas sudah ada
      kelasId = existingKelas[0].id;
      console.log("Existing kelas found with ID:", kelasId);
    } else {
      // Kelas belum ada, buat baru
      
      // Extract tingkat dari nama kelas (contoh: "X RPL 1" -> "X")
      const tingkat = kelas.startsWith("XII") ? "XII" 
                    : kelas.startsWith("XI") ? "XI" 
                    : "X";
      
      console.log("Creating new kelas:", { nama: kelas, tingkat, jurusan });
      
      const [kelasResult] = await connection.query<ResultSetHeader>(
        "INSERT INTO kelas (nama, tingkat, jurusan, isActive) VALUES (?, ?, ?, ?)",
        [kelas, tingkat, jurusan, true]
      );
      
      kelasId = kelasResult.insertId;
      console.log("New kelas created with ID:", kelasId);
    }

    // Insert ke users
    const [userResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, hashedPassword, "siswa"]
    );

    const userId = userResult.insertId;
    console.log("User inserted with ID:", userId);

    // Insert ke siswa dengan kelasId yang sudah pasti ada
    const [siswaResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO siswa (userId, nisn, nama, kelas, kelasId, jurusan, email, password, accses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, nisn, nama, kelas, kelasId, jurusan, email, hashedPassword, "no"]
    );

    console.log("Siswa inserted with ID:", siswaResult.insertId);

    await connection.commit();
    console.log("Transaction committed successfully");

    // Release connection
    connection.release();
    console.log("Connection released");

    revalidatePath("/auth/daftar");
    console.log("Registration completed successfully!");

  } catch (error) {
    console.error("Registration error:", error);

    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back");
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      } finally {
        connection.release();
        console.log("Connection released after rollback");
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Duplicate entry")) {
        if (error.message.includes("email")) {
          throw new Error("Email sudah terdaftar");
        }
        if (error.message.includes("nisn")) {
          throw new Error("NISN sudah terdaftar");
        }
        throw new Error("Data sudah terdaftar");
      }
      throw error;
    }
    
    throw new Error("Gagal menyimpan data registrasi");
  }
}

export async function getProfileSiswa(userId: number): Promise<Siswa | null> {
  try {
    const [rows] = await db.query<Siswa[]>(
      `SELECT 
        s.id,
        s.userId,
        s.nisn,
        s.nama,
        s.kelas,
        s.jurusan,
        s.email
      FROM siswa s
      WHERE s.userId = ?`,
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getProfileSiswa:", error);
    return null;
  }
}

export async function getProfileGuru(userId: number): Promise<Guru | null> {
  try {
    const [rows] = await db.query<Guru[]>(
      `SELECT 
        g.guruId,
        g.userId,
        g.nama,
        g.email
      FROM guru g
      WHERE g.userId = ?`,
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getProfileGuru:", error);
    return null;
  }
}

export async function getProfileAdmin(userId: number): Promise<Admin | null> {
  try {
    const [rows] = await db.query<Admin[]>(
      `SELECT 
        a.id,
        a.userId,
        a.nama,
        a.email
      FROM admin a
      WHERE a.userId = ?`,
      [userId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getProfileAdmin:", error);
    return null;
  }
}

export async function getProfile(
  userId: number, 
  role: "siswa" | "guru" | "admin"
): Promise<Siswa | Guru | Admin | null> {
  try {
    if (role === "siswa") {
      return await getProfileSiswa(userId);
    } else if (role === "guru") {
      return await getProfileGuru(userId);
    } else if (role === "admin") {
      return await getProfileAdmin(userId);
    }
    return null;
  } catch (error) {
    console.error("Error getProfile:", error);
    return null;
  }
}


//UBAH PASSWORD 

export async function changePassword(
  data: ChangePasswordInput
): Promise<ChangePasswordResult> {
  const { email, oldPassword, newPassword } = data;

  console.log("Starting change password process for:", email);

  // ============= VALIDASI INPUT =============
  if (!email || !oldPassword || !newPassword) {
    console.error("Missing required fields");
    throw new Error("Email, password lama, dan password baru harus diisi");
  }

  // Validasi email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Format email tidak valid");
  }

  // Validasi password baru
  if (newPassword.length < 8) {
    throw new Error("Password baru harus minimal 8 karakter");
  }

  if (oldPassword === newPassword) {
    throw new Error("Password baru harus berbeda dengan password lama");
  }

  let connection;

  try {
    connection = await db.getConnection();
    console.log("Database connection acquired");

    await connection.beginTransaction();
    console.log("Transaction started");

    // ============= GET USER DATA =============
    const [userRows] = await connection.query(
      "SELECT id, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      throw new Error("Email tidak terdaftar di sistem");
    }

    const user = userRows[0] as any;
    const userId = user.id;
    const userRole = user.role;

    console.log("User found:", { userId, email, role: userRole });

    // ============= VERIFIKASI PASSWORD LAMA DENGAN AUTO-SYNC =============
    console.log("Verifying old password with auto-sync...");
    
    const { isValid, currentHash } = await verifyPasswordWithSync(
      userId,
      userRole,
      oldPassword,
      connection
    );

    if (!isValid) {
      console.error("Old password verification failed");
      throw new Error("Password lama tidak sesuai");
    }

    console.log("Old password verified successfully");

    // ============= CEK PASSWORD BARU TIDAK SAMA DENGAN LAMA =============
    const isSameAsOld = await bcrypt.compare(newPassword, currentHash!);
    if (isSameAsOld) {
      throw new Error("Password baru harus berbeda dengan password lama");
    }

    // ============= HASH PASSWORD BARU =============
    console.log("Hashing new password...");
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed");

    // ============= UPDATE PASSWORD DI SEMUA TABEL =============
    console.log("Updating password in all related tables...");
    
    await updatePasswordEverywhere(
      userId,
      userRole,
      hashedNewPassword,
      connection
    );

    console.log("Password updated successfully in all tables");

    // ============= COMMIT TRANSACTION =============
    await connection.commit();
    console.log("Transaction committed successfully!");

    return {
      success: true,
      message: "Password berhasil diubah! Silakan login kembali dengan password baru.",
      userId: userId
    };

  } catch (error) {
    console.error("Change password error:", error);

    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Gagal mengubah password. Silakan coba lagi.");

  } finally {
    if (connection) {
      try {
        connection.release();
        console.log("Connection released");
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Memverifikasi password user tanpa mengubahnya
 * Berguna untuk double-check sebelum operasi kritis
 */
export async function verifyUserPassword(
  email: string,
  password: string
): Promise<boolean> {
  let connection;
  
  try {
    connection = await db.getConnection();
    
    const [userRows] = await connection.query(
      "SELECT id, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      return false;
    }

    const user = userRows[0] as any;
    
    // Gunakan helper verifyPasswordWithSync untuk konsistensi
    const { isValid } = await verifyPasswordWithSync(
      user.id,
      user.role,
      password,
      connection
    );
    
    return isValid;

  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Mengecek apakah user masih menggunakan password default
 */
export async function getUserPasswordStatus(
  userId: number,
  userRole: "siswa" | "guru" | "admin"
): Promise<{
  isDefault: boolean;
  lastChanged?: Date;
}> {
  let connection;
  
  try {
    const DEFAULT_PASSWORD = "SMK1234";
    
    connection = await db.getConnection();

    // Ambil password dari tabel users (source of truth)
    const [rows] = await connection.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    
    const userPassword = (Array.isArray(rows) && rows[0]) ? (rows[0] as any).password : null;

    if (!userPassword) {
      return { isDefault: false };
    }

    const isDefault = await bcrypt.compare(DEFAULT_PASSWORD, userPassword);

    return {
      isDefault: isDefault,
      lastChanged: undefined
    };

  } catch (error) {
    console.error("Error checking password status:", error);
    return { isDefault: false };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


//calendar CRUD
export async function getAllAgendas(): Promise<Agenda[]> {
  try {
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

    return rows.map((row) => ({
      id: row.id,
      nama: row.nama,
      kategori: row.kategori,
      tanggalMulai: row.tanggalMulai,
      tanggalAkhir: row.tanggalAkhir,
    }));
  } catch (error) {
    console.error("Error fetching agendas:", error);
    throw new Error("Gagal mengambil data agenda");
  }
}

// GET - Fetch agenda by ID
export async function getAgendaById(id: number): Promise<Agenda | null> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        nama,
        kategori,
        tanggalMulai,
        tanggalAkhir
      FROM agendaCalendar
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      nama: row.nama,
      kategori: row.kategori,
      tanggalMulai: row.tanggalMulai,
      tanggalAkhir: row.tanggalAkhir,
    };
  } catch (error) {
    console.error("Error fetching agenda:", error);
    throw new Error("Gagal mengambil data agenda");
  }
}

// POST - Create new agenda
export async function createAgenda(
  nama: string,
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
  tanggalMulai: string,
  tanggalAkhir?: string
): Promise<Agenda> {
  try {
    // Validation
    if (!nama || !kategori || !tanggalMulai) {
      throw new Error("Nama, kategori, dan tanggal mulai harus diisi");
    }

    // Validasi tanggal
    const startDate = new Date(tanggalMulai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new Error("Tanggal mulai tidak boleh sebelum hari ini");
    }

    if (tanggalAkhir) {
      const endDate = new Date(tanggalAkhir);
      if (endDate < startDate) {
        throw new Error("Tanggal akhir tidak boleh sebelum tanggal mulai");
      }
    }

    const [result] = await db.execute<any>(
      `INSERT INTO agendaCalendar (nama, kategori, tanggalMulai, tanggalAkhir)
       VALUES (?, ?, ?, ?)`,
      [nama, kategori, tanggalMulai, tanggalAkhir || null]
    );

    const agendaId = result.insertId;

    return {
      id: agendaId,
      nama,
      kategori,
      tanggalMulai,
      tanggalAkhir: tanggalAkhir || null,
    };
  } catch (error) {
    console.error("Error creating agenda:", error);
    throw error instanceof Error
      ? error
      : new Error("Gagal menambahkan agenda");
  }
}

// PATCH - Update agenda
export async function updateAgenda(
  id: number,
  nama: string,
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
  tanggalMulai: string,
  tanggalAkhir?: string
): Promise<Agenda> {
  try {
    // Validation
    if (!nama || !kategori || !tanggalMulai) {
      throw new Error("Nama, kategori, dan tanggal mulai harus diisi");
    }

    // Validasi tanggal
    const startDate = new Date(tanggalMulai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new Error("Tanggal mulai tidak boleh sebelum hari ini");
    }

    if (tanggalAkhir) {
      const endDate = new Date(tanggalAkhir);
      if (endDate < startDate) {
        throw new Error("Tanggal akhir tidak boleh sebelum tanggal mulai");
      }
    }

    const [result] = await db.execute<any>(
      `UPDATE agendaCalendar 
       SET nama = ?, kategori = ?, tanggalMulai = ?, tanggalAkhir = ?
       WHERE id = ?`,
      [nama, kategori, tanggalMulai, tanggalAkhir || null, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Agenda tidak ditemukan");
    }

    return {
      id,
      nama,
      kategori,
      tanggalMulai,
      tanggalAkhir: tanggalAkhir || null,
    };
  } catch (error) {
    console.error("Error updating agenda:", error);
    throw error instanceof Error
      ? error
      : new Error("Gagal mengupdate agenda");
  }
}

// DELETE - Delete agenda
export async function deleteAgenda(id: number): Promise<void> {
  try {
    const [result] = await db.execute<any>(
      "DELETE FROM agendaCalendar WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Agenda tidak ditemukan");
    }
  } catch (error) {
    console.error("Error deleting agenda:", error);
    throw error instanceof Error
      ? error
      : new Error("Gagal menghapus agenda");
  }
}


