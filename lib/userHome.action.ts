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