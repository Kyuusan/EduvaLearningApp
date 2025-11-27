//userHome.action.ts

'use server';

import db from './db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { RowDataPacket } from 'mysql2';

interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

interface TaskSummary {
  id: number;
  courseId: number;
  courseName: string;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  status: 'completed' | 'pending';
  submittedAt?: string;
  submissionStatus?: 'submitted' | 'late';
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

export interface CourseHistory extends Course {
  kelasNama?: string;
  lastAccessedAt: Date | string;
  accessCount: number;
}

// ==================== GET DASHBOARD METRICS ====================
export async function getDashboardMetrics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log('📊 Getting dashboard metrics for user:', session.user.id);

    // Get siswaId
    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT s.id as siswaId
       FROM users u
       INNER JOIN siswa s ON u.id = s.userId
       WHERE u.id = ?`,
      [session.user.id]
    );

    if (userRows.length === 0) {
      return { success: false, error: 'Student not found' };
    }

    const siswaId = userRows[0].siswaId;

    // Get metrics
    const [metricsRows] = await db.query<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT t.id) as totalTasks,
        COUNT(DISTINCT ts.id) as completedTasks,
        (COUNT(DISTINCT t.id) - COUNT(DISTINCT ts.id)) as pendingTasks
      FROM tugas t
      INNER JOIN course c ON t.courseId = c.id
      INNER JOIN course_kelas ck ON c.id = ck.courseId
      INNER JOIN siswa s ON s.kelasId = ck.kelasId
      LEFT JOIN tugasSelesai ts ON t.id = ts.tugasId AND ts.siswaId = s.id
      WHERE s.id = ?`,
      [siswaId]
    );

    const metrics = metricsRows[0];
    const completionRate = metrics.totalTasks > 0 
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
      : 0;

    const result: DashboardMetrics = {
      totalTasks: metrics.totalTasks || 0,
      completedTasks: metrics.completedTasks || 0,
      pendingTasks: metrics.pendingTasks || 0,
      completionRate
    };

    console.log('✅ Dashboard metrics:', result);

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    console.error('❌ Get dashboard metrics error:', error);
    return { success: false, error: 'Failed to get dashboard metrics' };
  }
}

// ==================== GET ALL TASKS FOR SISWA ====================
export async function getAllTasksSiswa() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log('📋 Getting all tasks for user:', session.user.id);

    // Get siswaId
    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT s.id as siswaId
       FROM users u
       INNER JOIN siswa s ON u.id = s.userId
       WHERE u.id = ?`,
      [session.user.id]
    );

    if (userRows.length === 0) {
      return { success: false, error: 'Student not found' };
    }

    const siswaId = userRows[0].siswaId;

    // Get all tasks dengan course info dan submission status
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.courseId,
        c.nama as courseName,
        t.judul,
        t.deskripsi,
        t.deadline,
        ts.id as submissionId,
        ts.submittedAt,
        ts.status as submissionStatus,
        CASE 
          WHEN ts.id IS NOT NULL THEN 'completed'
          ELSE 'pending'
        END as status
      FROM tugas t
      INNER JOIN course c ON t.courseId = c.id
      INNER JOIN course_kelas ck ON c.id = ck.courseId
      INNER JOIN siswa s ON s.kelasId = ck.kelasId
      LEFT JOIN tugasSelesai ts ON t.id = ts.tugasId AND ts.siswaId = s.id
      WHERE s.id = ?
      ORDER BY t.deadline ASC`,
      [siswaId]
    );

    console.log('✅ Found tasks:', rows.length);

    return {
      success: true,
      data: rows as TaskSummary[]
    };

  } catch (error: any) {
    console.error('❌ Get all tasks error:', error);
    return { success: false, error: 'Failed to get tasks' };
  }
}

// ==================== GET COMPLETED TASKS ====================
export async function getCompletedTasksSiswa() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get siswaId
    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT s.id as siswaId
       FROM users u
       INNER JOIN siswa s ON u.id = s.userId
       WHERE u.id = ?`,
      [session.user.id]
    );

    if (userRows.length === 0) {
      return { success: false, error: 'Student not found' };
    }

    const siswaId = userRows[0].siswaId;

    // Get only completed tasks
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.courseId,
        c.nama as courseName,
        t.judul,
        t.deskripsi,
        t.deadline,
        ts.id as submissionId,
        ts.submittedAt,
        ts.status as submissionStatus,
        'completed' as status
      FROM tugas t
      INNER JOIN course c ON t.courseId = c.id
      INNER JOIN tugasSelesai ts ON t.id = ts.tugasId
      INNER JOIN siswa s ON ts.siswaId = s.id
      WHERE s.id = ?
      ORDER BY ts.submittedAt DESC`,
      [siswaId]
    );

    return {
      success: true,
      data: rows as TaskSummary[]
    };

  } catch (error: any) {
    console.error('❌ Get completed tasks error:', error);
    return { success: false, error: 'Failed to get completed tasks' };
  }
}

// ========================================
// COURSE HISTORY TRACKING
// ========================================


export async function recordCourseAccess(courseId: number): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "siswa") {
    throw new Error("Only students can record course access");
  }

  try {
    // 1. Ambil siswaId dari userId
    const [siswaRows] = await db.query(
      `SELECT id FROM siswa WHERE userId = ?`,
      [session.user.id]
    );
    
    const siswa = (siswaRows as any[])[0];
    
    if (!siswa) {
      throw new Error("Student record not found");
    }

    // 2. Insert atau Update history

    await db.query(`
      INSERT INTO courseHistory (courseId, siswaId, lastAccessedAt, accessCount)
      VALUES (?, ?, NOW(), 1)
      ON DUPLICATE KEY UPDATE 
        lastAccessedAt = NOW(),
        accessCount = accessCount + 1
    `, [courseId, siswa.id]);

    console.log(`✓ Course access recorded: courseId=${courseId}, siswaId=${siswa.id}`);
    
  } catch (error) {
    console.error("Error recording course access:", error);

  }
}


export async function getCourseHistory(): Promise<Course[]> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "siswa") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Ambil siswaId
    const [siswaRows] = await db.query(
      `SELECT id, kelasId FROM siswa WHERE userId = ?`,
      [session.user.id]
    );
    
    const siswa = (siswaRows as any[])[0];
    
    if (!siswa) {
      return [];
    }

    // 2. Query course yang pernah dibuka, diurutkan dari yang terakhir dibuka
    const query = `
      SELECT DISTINCT
        c.id, 
        c.guruId, 
        c.adminId, 
        c.nama, 
        c.deskripsi, 
        c.kategori, 
        c.tingkat, 
        c.imageUrl, 
        c.createdAt,
        ch.lastAccessedAt,
        ch.accessCount,
        k.nama as kelasNama
      FROM course c
      INNER JOIN courseHistory ch ON c.id = ch.courseId
      INNER JOIN course_kelas ck ON c.id = ck.courseId
      INNER JOIN kelas k ON ck.kelasId = k.id
      WHERE ch.siswaId = ? 
        AND ck.kelasId = ?
      ORDER BY ch.lastAccessedAt DESC
      LIMIT 20
    `;

    const [rows] = await db.query(query, [siswa.id, siswa.kelasId]);
    
    console.log(`✓ Found ${(rows as any[]).length} courses in history`);
    
    return rows as Course[];
    
  } catch (error) {
    console.error("Error fetching course history:", error);
    throw new Error("Failed to fetch course history");
  }
}

/**
 * Get jumlah total course yang pernah diakses siswa
 */
export async function getTotalAccessedCourses(): Promise<number> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "siswa") {
    return 0;
  }

  try {
    const [siswaRows] = await db.query(
      `SELECT id FROM siswa WHERE userId = ?`,
      [session.user.id]
    );
    
    const siswa = (siswaRows as any[])[0];
    
    if (!siswa) {
      return 0;
    }

    const [result] = await db.query(
      `SELECT COUNT(*) as total FROM courseHistory WHERE siswaId = ?`,
      [siswa.id]
    );
    
    return (result as any)[0].total;
    
  } catch (error) {
    console.error("Error getting total accessed courses:", error);
    return 0;
  }
}