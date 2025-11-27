//course.action.ts

"use server";

import db from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// INTERFACES

export interface Kelas {
  id: number;
  nama: string;
  tingkat: "X" | "XI" | "XII";
  jurusan: "RPL" | "TJKT" | "PSPT" | "ANIM";
  isActive: boolean;
  jumlahSiswa?: number;
}

export interface Course {
  id: number;
  guruId: number | null;
  adminId: number | null;
  nama: string;
  deskripsi: string;
  kategori: "Umum" | "Kejuruan";
  tingkat: "X" | "XI" | "XII";
  imageUrl: string;
  createdAt: Date;
  enrolledKelas?: Array<{
    kelasId: number;
    kelasNama: string;
  }>;
}

export interface CreateCourseInput {
  nama: string;
  deskripsi: string;
  kategori: "Umum" | "Kejuruan";
  tingkat: "X" | "XI" | "XII";
  kelasIds: number[];
  imageUrl: string;
}

export interface UpdateCourseInput extends CreateCourseInput {
  id: number;
}

// KELAS MANAGEMENT

/**
 * Get all kelas untuk dropdown saat create course
 */
export async function getAllKelas(): Promise<Kelas[]> {
  try {
    const query = `
      SELECT 
        k.id, 
        k.nama, 
        k.tingkat, 
        k.jurusan,
        k.isActive,
        COUNT(s.id) as jumlahSiswa
      FROM kelas k
      LEFT JOIN siswa s ON k.id = s.kelasId
      WHERE k.isActive = TRUE
      GROUP BY k.id
      ORDER BY k.tingkat, k.jurusan, k.nama
    `;
    
    const [rows] = await db.query(query);
    return rows as Kelas[];
  } catch (error) {
    console.error("Error fetching kelas:", error);
    throw new Error("Failed to fetch kelas");
  }
}

/**
 * Get kelas by tingkat (untuk filter)
 */
export async function getKelasByTingkat(tingkat: "X" | "XI" | "XII"): Promise<Kelas[]> {
  try {
    const query = `
      SELECT 
        k.id, 
        k.nama, 
        k.tingkat, 
        k.jurusan,
        k.isActive,
        COUNT(s.id) as jumlahSiswa
      FROM kelas k
      LEFT JOIN siswa s ON k.id = s.kelasId
      WHERE k.isActive = TRUE AND k.tingkat = ?
      GROUP BY k.id
      ORDER BY k.jurusan, k.nama
    `;
    
    const [rows] = await db.query(query, [tingkat]);
    return rows as Kelas[];
  } catch (error) {
    console.error("Error fetching kelas by tingkat:", error);
    throw new Error("Failed to fetch kelas");
  }
}

// GET COURSES BY ROLE

/**
 * Get courses untuk Guru/Admin - hanya yang mereka buat
 */
/**
 * Get courses untuk Guru/Admin - hanya yang mereka buat
 */
export async function getCoursesByCreator(): Promise<Course[]> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  console.log('=== GET COURSES BY CREATOR ===');
  console.log('Session user:', {
    id: session.user.id,
    roleId: session.user.roleId,
    role: session.user.role
  });

  try {
    let query = "";
    let params: any[] = [];

    if (session.user.role === "guru") {
      // ✅ PERBAIKAN: Gunakan roleId (guru.guruId), bukan user.id
      query = `
        SELECT 
          c.id, c.guruId, c.adminId, c.nama, c.deskripsi, 
          c.kategori, c.tingkat, c.imageUrl, c.createdAt,
          GROUP_CONCAT(
            JSON_OBJECT('kelasId', k.id, 'kelasNama', k.nama)
          ) as enrolledKelas
        FROM course c
        LEFT JOIN course_kelas ck ON c.id = ck.courseId
        LEFT JOIN kelas k ON ck.kelasId = k.id
        WHERE c.guruId = ?
        GROUP BY c.id
        ORDER BY c.createdAt DESC
      `;
      params = [session.user.roleId]; // ✅ Pakai roleId, bukan id
      
      console.log('Query type: GURU');
      console.log('Searching for guruId:', session.user.roleId);
      
    } else {
      // ✅ PERBAIKAN: Untuk admin juga pakai roleId
      query = `
        SELECT 
          c.id, c.guruId, c.adminId, c.nama, c.deskripsi, 
          c.kategori, c.tingkat, c.imageUrl, c.createdAt,
          GROUP_CONCAT(
            JSON_OBJECT('kelasId', k.id, 'kelasNama', k.nama)
          ) as enrolledKelas
        FROM course c
        LEFT JOIN course_kelas ck ON c.id = ck.courseId
        LEFT JOIN kelas k ON ck.kelasId = k.id
        WHERE c.adminId = ?
        GROUP BY c.id
        ORDER BY c.createdAt DESC
      `;
      params = [session.user.roleId]; // ✅ Pakai roleId, bukan id
      
      console.log('Query type: ADMIN');
      console.log('Searching for adminId:', session.user.roleId);
    }

    console.log('Executing query with params:', params);

    const [rows] = await db.query(query, params);
    
    console.log('Raw query result:', rows);
    console.log('Number of rows:', (rows as any[]).length);

    const courses = (rows as any[]).map((row) => {
      const enrolledKelas = row.enrolledKelas 
        ? JSON.parse(`[${row.enrolledKelas}]`)
        : [];
      
      return {
        ...row,
        enrolledKelas
      };
    });

    console.log('Processed courses:', courses.length);
    console.log('✅ getCoursesByCreator completed');

    return courses;
  } catch (error) {
    console.error("❌ Error fetching courses by creator:", error);
    throw new Error("Failed to fetch courses");
  }
}
/**
 * Get courses untuk Siswa - berdasarkan kelas yang di-enroll
 */
export async function getCoursesByStudent(): Promise<Course[]> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "siswa") {
    throw new Error("Unauthorized");
  }

  try {
    // Ambil kelasId siswa
    const [siswaRows] = await db.query(
      `SELECT kelasId, kelas FROM siswa WHERE userId = ?`,
      [session.user.id]
    );
    
    const siswa = (siswaRows as any[])[0];
    
    if (!siswa || !siswa.kelasId) {
      return [];
    }

    // Query course yang kelas siswa ini ter-enroll
    const query = `
      SELECT DISTINCT
        c.id, c.guruId, c.adminId, c.nama, c.deskripsi, 
        c.kategori, c.tingkat, c.imageUrl, c.createdAt,
        k.nama as kelasNama,
        ck.enrolledAt
      FROM course c
      INNER JOIN course_kelas ck ON c.id = ck.courseId
      INNER JOIN kelas k ON ck.kelasId = k.id
      WHERE ck.kelasId = ?
      ORDER BY ck.enrolledAt DESC
    `;

    const [rows] = await db.query(query, [siswa.kelasId]);
    return rows as Course[];
  } catch (error) {
    console.error("Error fetching courses for student:", error);
    throw new Error("Failed to fetch courses");
  }
}

// ========================================
// GET SINGLE COURSE
// ========================================

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const query = `
      SELECT 
        c.id, c.guruId, c.adminId, c.nama, c.deskripsi, 
        c.kategori, c.tingkat, c.imageUrl, c.createdAt,
        GROUP_CONCAT(
          JSON_OBJECT('kelasId', k.id, 'kelasNama', k.nama)
        ) as enrolledKelas
      FROM course c
      LEFT JOIN course_kelas ck ON c.id = ck.courseId
      LEFT JOIN kelas k ON ck.kelasId = k.id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const [rows] = await db.query(query, [id]);
    const courses = rows as any[];

    if (courses.length === 0) {
      return null;
    }

    const course = courses[0];
    course.enrolledKelas = course.enrolledKelas 
      ? JSON.parse(`[${course.enrolledKelas}]`)
      : [];

    return course;
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw new Error("Failed to fetch course");
  }
}

// ========================================
// CREATE COURSE
// ========================================

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  console.log('=== CREATE COURSE DEBUG ===');
  console.log('Input data:', JSON.stringify(data, null, 2));
  console.log('Session user:', JSON.stringify({
    id: session.user.id,
    roleId: session.user.roleId, // ✅ PENTING: roleId ini yang benar
    role: session.user.role,
    email: session.user.email
  }, null, 2));

  if (!data.nama || !data.deskripsi || !data.kategori || !data.tingkat || data.kelasIds.length === 0) {
    throw new Error("All fields are required");
  }

  // ✅ VALIDASI roleId
  if (!session.user.roleId) {
    throw new Error("RoleId not found in session. Please login again.");
  }

  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('✓ Database connection acquired');

    await connection.beginTransaction();
    console.log('✓ Transaction started');

    // ✅ PERBAIKAN UTAMA: Gunakan roleId, bukan user.id
    const guruId = session.user.role === "guru" ? session.user.roleId : null;
    const adminId = session.user.role === "admin" ? session.user.roleId : null;

    console.log('User IDs:', { guruId, adminId });

    // ✅ VALIDASI: Pastikan salah satu terisi
    if (!guruId && !adminId) {
      throw new Error("Invalid user role configuration");
    }

    // 1. Insert course
    const courseQuery = `
      INSERT INTO course (guruId, adminId, nama, deskripsi, kategori, tingkat, imageUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const courseParams = [
      guruId,
      adminId,
      data.nama,
      data.deskripsi,
      data.kategori,
      data.tingkat,
      data.imageUrl || "/og.jpg",
    ];

    console.log('Executing course insert with params:', courseParams);

    const [result] = await connection.query(courseQuery, courseParams);
    const courseId = (result as any).insertId;
    
    console.log('✓ Course inserted with ID:', courseId);

    // 2. Check if kelasIds exist
    const [kelasCheck] = await connection.query(
      `SELECT id FROM kelas WHERE id IN (?)`,
      [data.kelasIds]
    );
    
    console.log('Kelas check result:', kelasCheck);
    console.log('Requested kelasIds:', data.kelasIds);
    console.log('Found kelas:', (kelasCheck as any[]).map(k => k.id));

    if ((kelasCheck as any[]).length !== data.kelasIds.length) {
      throw new Error(
        `Some kelas IDs not found. Requested: [${data.kelasIds.join(', ')}], ` +
        `Found: [${(kelasCheck as any[]).map(k => k.id).join(', ')}]`
      );
    }

    // 3. Insert course_kelas
    if (data.kelasIds.length > 0) {
      for (const kelasId of data.kelasIds) {
        console.log(`Inserting course_kelas: courseId=${courseId}, kelasId=${kelasId}, enrolledBy=${session.user.id}`);
        
        await connection.query(`
          INSERT INTO course_kelas (courseId, kelasId, enrolledBy)
          VALUES (?, ?, ?)
        `, [courseId, kelasId, session.user.id]); // ✅ enrolledBy tetap pakai user.id
      }
      
      console.log('✓ All course_kelas entries inserted');
    }

    await connection.commit();
    console.log('✓ Transaction committed');

    revalidatePath("/dashboard/course");

    const createdCourse = await getCourseById(courseId);
    if (!createdCourse) {
      throw new Error("Failed to retrieve created course");
    }

    console.log('✓ Course created successfully:', createdCourse.id);
    return createdCourse;

  } catch (error: any) {
    console.error('❌ ERROR in createCourse:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sql:', error.sql);
    console.error('Full error:', error);
    
    if (connection) {
      await connection.rollback();
      console.log('✓ Transaction rolled back');
    }
    
    throw new Error(`Failed to create course: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
      console.log('✓ Connection released');
    }
  }
}
// ========================================
// UPDATE COURSE
// ========================================

export async function updateCourse(data: UpdateCourseInput): Promise<Course> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  if (!data.id || !data.nama || !data.deskripsi || data.kelasIds.length === 0) {
    throw new Error("All fields are required");
  }

  // ✅ Validasi roleId
  if (!session.user.roleId) {
    throw new Error("RoleId not found in session. Please login again.");
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log('=== UPDATE COURSE DEBUG ===');
    console.log('Course ID:', data.id);
    console.log('User:', { id: session.user.id, roleId: session.user.roleId, role: session.user.role });

    // Cek ownership
    const existingCourse = await getCourseById(data.id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    console.log('Existing course:', { 
      id: existingCourse.id, 
      guruId: existingCourse.guruId, 
      adminId: existingCourse.adminId 
    });

    // ✅ Ownership check sudah benar
    const isOwner =
      (session.user.role === "guru" && existingCourse.guruId === session.user.roleId) ||
      (session.user.role === "admin" && existingCourse.adminId === session.user.roleId);

    if (!isOwner) {
      throw new Error("You don't have permission to update this course");
    }

    console.log('✓ Ownership verified');

    // 1. Update course
    const [updateResult] = await connection.query(`
      UPDATE course
      SET nama = ?, deskripsi = ?, kategori = ?, tingkat = ?, imageUrl = ?
      WHERE id = ?
    `, [
      data.nama, 
      data.deskripsi, 
      data.kategori, 
      data.tingkat, 
      data.imageUrl || "/og.jpg", 
      data.id
    ]);

    console.log('✓ Course updated');

    // 2. Delete existing kelas enrollments
    await connection.query(`DELETE FROM course_kelas WHERE courseId = ?`, [data.id]);
    console.log('✓ Old enrollments deleted');

    // 3. Validate kelasIds exist
    if (data.kelasIds.length > 0) {
      const [kelasCheck] = await connection.query(
        `SELECT id FROM kelas WHERE id IN (?)`,
        [data.kelasIds]
      );

      if ((kelasCheck as any[]).length !== data.kelasIds.length) {
        throw new Error(
          `Some kelas IDs not found. Requested: [${data.kelasIds.join(', ')}], ` +
          `Found: [${(kelasCheck as any[]).map(k => k.id).join(', ')}]`
        );
      }

      // 4. Insert new kelas enrollments
      // ✅ PERBAIKAN: Gunakan prepared statement untuk keamanan
      for (const kelasId of data.kelasIds) {
        await connection.query(`
          INSERT INTO course_kelas (courseId, kelasId, enrolledBy)
          VALUES (?, ?, ?)
        `, [data.id, kelasId, session.user.id]); // enrolledBy tetap pakai user.id
      }

      console.log('✓ New enrollments inserted:', data.kelasIds.length);
    }

    await connection.commit();
    console.log('Transaction committed');

    revalidatePath("/admin/course");
    revalidatePath(`/admin/course/${data.id}`);
    revalidatePath("/admin/course"); // ✅ Tambahan untuk admin route

    const updatedCourse = await getCourseById(data.id);
    if (!updatedCourse) {
      throw new Error("Failed to retrieve updated course");
    }

    console.log('✓ Course updated successfully');
    return updatedCourse;

  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      console.log('✓ Transaction rolled back');
    }
    
    console.error("Error updating course:", error);
    
    // ✅ Better error messages
    if (error.message.includes("not found")) {
      throw new Error(error.message);
    }
    if (error.message.includes("permission")) {
      throw new Error(error.message);
    }
    
    throw new Error(`Failed to update course: ${error.message}`);
    
  } finally {
    if (connection) {
      connection.release();
      console.log('✓ Connection released');
    }
  }
}

// ========================================
// DELETE COURSE
// ========================================

export async function deleteCourse(id: number): Promise<{ success: boolean }> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  try {
    const existingCourse = await getCourseById(id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    const isOwner =
      (session.user.role === "guru" && existingCourse.guruId === session.user.id) ||
      (session.user.role === "admin" && existingCourse.adminId === session.user.id);

    if (!isOwner) {
      throw new Error("You don't have permission to delete this course");
    }

    // CASCADE akan auto-delete course_kelas
    await db.query(`DELETE FROM course WHERE id = ?`, [id]);

    revalidatePath("/dashboard/course");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    throw new Error("Failed to delete course");
  }
}

// ========================================
// ENROLLMENT HELPERS
// ========================================

/**
 * Check apakah siswa punya akses ke course
 */
export async function checkStudentAccess(courseId: number): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "siswa") {
    return false;
  }

  try {
    const query = `
      SELECT COUNT(*) as hasAccess
      FROM course_kelas ck
      INNER JOIN siswa s ON ck.kelasId = s.kelasId
      WHERE ck.courseId = ? AND s.userId = ?
    `;

    const [rows] = await db.query(query, [courseId, session.user.id]);
    return (rows as any)[0].hasAccess > 0;
  } catch (error) {
    console.error("Error checking student access:", error);
    return false;
  }
}

/**
 * Get enrolled kelas for a course
 */
export async function getEnrolledKelas(courseId: number): Promise<Kelas[]> {
  try {
    const query = `
      SELECT 
        k.id, 
        k.nama, 
        k.tingkat, 
        k.jurusan,
        k.isActive,
        COUNT(s.id) as jumlahSiswa
      FROM kelas k
      INNER JOIN course_kelas ck ON k.id = ck.kelasId
      LEFT JOIN siswa s ON k.id = s.kelasId
      WHERE ck.courseId = ?
      GROUP BY k.id
      ORDER BY k.tingkat, k.jurusan, k.nama
    `;
    
    const [rows] = await db.query(query, [courseId]);
    return rows as Kelas[];
  } catch (error) {
    console.error("Error fetching enrolled kelas:", error);
    throw new Error("Failed to fetch enrolled kelas");
  }
}