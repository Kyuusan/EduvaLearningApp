'use server';

import db from './db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { RowDataPacket} from 'mysql2';

// ==================== GET SUBMISSIONS BY COURSE (GURU/ADMIN) ====================
export async function getSubmissionsByCourse(courseId: number) {
  console.log('=== GET SUBMISSIONS BY COURSE START ===');
  console.log('CourseId:', courseId);
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session ? {
      id: session.user?.id,
      role: session.user?.role
    } : 'NULL');
    
    if (!session?.user?.id) {
      console.error('No session user ID');
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'guru' && session.user.role !== 'admin') {
      return { success: false, error: 'Only teachers and admins can view submissions' };
    }

    console.log('Querying submissions...');

    // Query semua tugas di course dengan submission info
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        t.id as tugasId,
        t.judul as tugasJudul,
        t.deadline,
        ts.id as submissionId,
        ts.siswaId,
        s.nama as siswaNama,
        s.nisn,
        k.nama as kelasNama,
        ts.fileUrl,
        ts.fileName,
        ts.fileSize,
        ts.status,
        ts.submittedAt
      FROM tugas t
      INNER JOIN course_kelas ck ON t.courseId = ck.courseId
      INNER JOIN kelas k ON ck.kelasId = k.id
      INNER JOIN siswa s ON k.id = s.kelasId
      LEFT JOIN tugasSelesai ts ON t.id = ts.tugasId AND s.id = ts.siswaId
      WHERE t.courseId = ?
      ORDER BY t.id, k.nama, s.nama`,
      [courseId]
    );

    console.log(' Found submissions:', rows.length);

    // Group by tugasId
    const groupedData: Record<number, {
      tugasId: number;
      tugasJudul: string;
      deadline: string;
      submissions: Array<{
        submissionId: number | null;
        siswaId: number;
        siswaNama: string;
        nisn: string;
        kelasNama: string;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: number | null;
        status: 'submitted' | 'late' | 'not_submitted';
        submittedAt: string | null;
      }>;
      totalStudents: number;
      submittedCount: number;
      lateCount: number;
      notSubmittedCount: number;
    }> = {};

    rows.forEach(row => {
      if (!groupedData[row.tugasId]) {
        groupedData[row.tugasId] = {
          tugasId: row.tugasId,
          tugasJudul: row.tugasJudul,
          deadline: row.deadline,
          submissions: [],
          totalStudents: 0,
          submittedCount: 0,
          lateCount: 0,
          notSubmittedCount: 0
        };
      }

      const status = row.submissionId 
        ? row.status 
        : 'not_submitted';

      groupedData[row.tugasId].submissions.push({
        submissionId: row.submissionId,
        siswaId: row.siswaId,
        siswaNama: row.siswaNama,
        nisn: row.nisn,
        kelasNama: row.kelasNama,
        fileUrl: row.fileUrl,
        fileName: row.fileName,
        fileSize: row.fileSize,
        status: status as 'submitted' | 'late' | 'not_submitted',
        submittedAt: row.submittedAt
      });

      groupedData[row.tugasId].totalStudents++;

      if (status === 'submitted') {
        groupedData[row.tugasId].submittedCount++;
      } else if (status === 'late') {
        groupedData[row.tugasId].lateCount++;
      } else {
        groupedData[row.tugasId].notSubmittedCount++;
      }
    });

    const result = Object.values(groupedData);

    console.log(' Summary:', {
      totalTasks: result.length,
      totalSubmissions: rows.filter(r => r.submissionId).length
    });

    console.log(' === GET SUBMISSIONS BY COURSE SUCCESS ===');

    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    console.error('=== GET SUBMISSIONS BY COURSE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error SQL:', error.sql);
    console.error('Error stack:', error.stack);
    
    return { 
      success: false, 
      error: `Failed to get submissions: ${error.message}` 
    };
  }
}

// ==================== DOWNLOAD SUBMISSION FILE (GURU/ADMIN) ====================
export async function getSubmissionFileUrl(submissionId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'guru' && session.user.role !== 'admin') {
      return { success: false, error: 'Only teachers and admins can download submissions' };
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT ts.fileUrl, ts.fileName, s.nama as siswaNama
       FROM tugasSelesai ts
       INNER JOIN siswa s ON ts.siswaId = s.id
       WHERE ts.id = ?`,
      [submissionId]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Submission not found' };
    }

    if (!rows[0].fileUrl) {
      console.log(' No file attached to submission:', submissionId);
      return { success: false, error: 'No file available' };
    }

    console.log('File found for submission:', submissionId);

    return {
      success: true,
      data: {
        fileUrl: rows[0].fileUrl,
        fileName: rows[0].fileName,
        siswaNama: rows[0].siswaNama
      }
    };
  } catch (error) {
    console.error(' Get submission file error:', error);
    return { success: false, error: 'Failed to get file' };
  }
}