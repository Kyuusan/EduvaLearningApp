//task.action.ts

'use server';

import db from './db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { revalidatePath } from 'next/cache';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ==================== TYPES ====================


interface Task {
  id: number;
  courseId: number;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdBy: number;
  createdAt: string;
  status?: 'completed' | 'pending';
  submissionId?: number;
  submittedAt?: string;
}

interface Task {
  id: number;
  courseId: number;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdBy: number;
  createdAt: string;
  status?: 'completed' | 'pending';
  submissionId?: number;
  submittedAt?: string;
  submissionStatus?: 'submitted' | 'late'; 
}

export async function getUserRoleId(session: any) {

  if (session.user.role === 'guru' || session.user.role === 'admin') {
    return session.user.roleId; 
  }
  
  // Untuk siswa, ambil dari database
  const [userRows] = await db.query<RowDataPacket[]>(
    'SELECT siswaId FROM users WHERE id = ?',
    [session.user.id]
  );
  
  return userRows.length > 0 ? userRows[0].siswaId : null;
}

// ========================================
// GET COURSE DETAIL (untuk detail page)
// ========================================

export async function getCourseDetail(courseId: number) {
  console.log('🔥 getCourseDetail START - courseId:', courseId);
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔥 Session retrieved:', session ? {
      id: session.user?.id,
      role: session.user?.role
    } : 'NULL');
    
    if (!session?.user?.id) {
      console.log('❌ No session user ID');
      return { success: false, error: 'Unauthorized' };
    }

    console.log('=== GET COURSE DETAIL DEBUG ===');
    
    const [courseRows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM course WHERE id = ?`,
      [courseId]
    );

    console.log('📚 Course found:', courseRows.length);
    if (courseRows.length === 0) {
      return { success: false, error: 'Course not found' };
    }

    const course = courseRows[0];
    console.log('guruId:', course.guruId);
    console.log('adminId:', course.adminId);

    let namaGuru = 'Unknown';
    
    if (course.guruId) {
      console.log('🔄 Fetching guru...');
      const [guruRows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM guru WHERE guruId = ?`,
        [course.guruId]
      );
      console.log('Guru rows:', guruRows);
      
      if (guruRows.length > 0) {
        if (guruRows[0].userId) {
          const [userRows] = await db.query<RowDataPacket[]>(
            `SELECT nama FROM users WHERE id = ?`,
            [guruRows[0].userId]
          );
          console.log('User rows:', userRows);
          if (userRows.length > 0) {
            namaGuru = userRows[0].nama;
          }
        } else if (guruRows[0].nama) {
          namaGuru = guruRows[0].nama;
        }
      }
    } else if (course.adminId) {
      console.log('🔄 Fetching admin...');
      const [adminRows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM admin WHERE id = ?`,
        [course.adminId]
      );
      console.log('Admin rows:', adminRows);
      
      if (adminRows.length > 0) {
        if (adminRows[0].userId) {
          const [userRows] = await db.query<RowDataPacket[]>(
            `SELECT nama FROM users WHERE id = ?`,
            [adminRows[0].userId]
          );
          console.log('User rows:', userRows);
          if (userRows.length > 0) {
            namaGuru = userRows[0].nama;
          }
        } else if (adminRows[0].nama) {
          namaGuru = adminRows[0].nama;
        }
      }
    }

    console.log('Final namaGuru:', namaGuru);

    // Get enrolled classes
    console.log('🔄 Fetching enrolled classes...');
    const [classRows] = await db.query<RowDataPacket[]>(
      `SELECT k.nama as namaKelas
      FROM course_kelas ck
      INNER JOIN kelas k ON ck.kelasId = k.id
      WHERE ck.courseId = ?
      ORDER BY k.nama`,
      [courseId]
    );

    console.log('Classes found:', classRows.length);
    const enrolledClasses = classRows.map(row => row.namaKelas);
    console.log('enrolledClasses:', enrolledClasses);

    const result = {
      id: course.id,
      namaCourse: course.nama,
      namaGuru: namaGuru,
      deskripsi: course.deskripsi,
      kategori: course.kategori,
      tingkat: course.tingkat,
      imageUrl: course.imageUrl,
      guruId: course.guruId,
      adminId: course.adminId,
      enrolledClasses
    };

    console.log('✅ getCourseDetail SUCCESS');
    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    console.error('❌ Get course detail error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: 'Failed to get course detail' };
  }
}

// ==================== GET TASKS (GURU) ====================
export async function getTasksGuru(courseId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log('📚 Fetching tasks for courseId:', courseId);

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        id,
        courseId,
        judul,
        deskripsi,
        deadline,
        fileUrl,
        fileName,
        fileSize,
        createdBy,
        createdAt
      FROM tugas
      WHERE courseId = ?
      ORDER BY deadline DESC`,
      [courseId]
    );

    console.log('✅ Found tasks:', rows.length);
    console.log('📄 Tasks with files:', rows.filter(t => t.fileUrl).length);
    
    // Log each task's file info
    rows.forEach((task, idx) => {
      console.log(`Task ${idx + 1}:`, {
        id: task.id,
        judul: task.judul,
        hasFile: !!task.fileUrl,
        fileUrl: task.fileUrl,
        fileName: task.fileName,
        fileSize: task.fileSize
      });
    });

    return {
      success: true,
      data: rows as Task[]
    };
  } catch (error) {
    console.error('❌ Get tasks error:', error);
    return { success: false, error: 'Failed to get tasks' };
  }
}

export async function getTasksSiswa(courseId: number) {
  console.log('🎯 === GET TASKS SISWA START ===');
  console.log('📌 CourseId:', courseId);
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'NULL');
    
    if (!session?.user?.id) {
      console.error('❌ No session user ID');
      return { success: false, error: 'Unauthorized' };
    }

    console.log('🔍 Step 1: Getting siswaId via JOIN...');
    
    // ✅ FIXED: Join users dengan siswa untuk dapat siswa.id
    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT u.id as userId, u.email, u.role, s.id as siswaId, s.nama
       FROM users u
       INNER JOIN siswa s ON u.id = s.userId
       WHERE u.id = ?`,
      [session.user.id]
    );

    console.log('📊 User query result:', userRows);

    if (userRows.length === 0) {
      console.error('❌ Student not found for userId:', session.user.id);
      return { success: false, error: 'Student data not found' };
    }

    const siswaId = userRows[0].siswaId;
    console.log('✅ Found siswaId:', siswaId);

    console.log('🔍 Step 2: Querying tasks with submissions...');
    
    // Query tasks dengan submission info
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.courseId,
        t.judul,
        t.deskripsi,
        t.deadline,
        t.fileUrl,
        t.fileName,
        t.fileSize,
        t.createdBy,
        t.createdAt,
        ts.id as submissionId,
        ts.submittedAt,
        ts.status as submissionStatus,
        CASE 
          WHEN ts.id IS NOT NULL THEN 'completed'
          ELSE 'pending'
        END as status
      FROM tugas t
      LEFT JOIN tugasSelesai ts ON t.id = ts.tugasId AND ts.siswaId = ?
      WHERE t.courseId = ?
      ORDER BY t.deadline DESC`,
      [siswaId, courseId]
    );

    console.log('✅ Found tasks:', rows.length);
    
    rows.forEach((task, idx) => {
      console.log(`📄 Task ${idx + 1}:`, {
        id: task.id,
        judul: task.judul,
        status: task.status,
        hasSubmission: !!task.submissionId,
        submissionStatus: task.submissionStatus
      });
    });

    console.log('🎉 === GET TASKS SISWA SUCCESS ===');
    
    return {
      success: true,
      data: rows as Task[]
    };
  } catch (error: any) {
    console.error('❌ === GET TASKS SISWA ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error SQL:', error.sql);
    console.error('Error stack:', error.stack);
    
    return { 
      success: false, 
      error: `Failed to get tasks: ${error.message}` 
    };
  }
}

// ==================== CREATE TASK (GURU) ====================
export async function createTask(formData: {
  courseId: number;
  judul: string;
  deskripsi?: string;
  deadline: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'guru' && session.user.role !== 'admin') {
      return { success: false, error: 'Only teachers and admins can create tasks' };
    }

    console.log('📝 Creating task with data:', {
      courseId: formData.courseId,
      judul: formData.judul,
      hasFile: !!formData.fileUrl,
      fileUrl: formData.fileUrl,
      fileName: formData.fileName,
      fileSize: formData.fileSize,
      createdBy: session.user.id,
      role: session.user.role
    });

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO tugas 
      (courseId, judul, deskripsi, deadline, fileUrl, fileName, fileSize, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.courseId,
        formData.judul,
        formData.deskripsi || null,
        formData.deadline,
        formData.fileUrl || null,
        formData.fileName || null,
        formData.fileSize || null,
        session.user.id
      ]
    );

    console.log('✅ Task created with ID:', result.insertId);

    // ✅ Verify the inserted data
    const [verifyRows] = await db.query<RowDataPacket[]>(
      'SELECT id, judul, fileUrl, fileName, fileSize FROM tugas WHERE id = ?',
      [result.insertId]
    );

    if (verifyRows.length > 0) {
      console.log('✅ Verified task data:', {
        id: verifyRows[0].id,
        judul: verifyRows[0].judul,
        fileUrl: verifyRows[0].fileUrl,
        fileName: verifyRows[0].fileName,
        fileSize: verifyRows[0].fileSize
      });
    }

    revalidatePath(`/user/course/${formData.courseId}`);
    revalidatePath(`/admin/course/${formData.courseId}`);

    return {
      success: true,
      data: { id: result.insertId }
    };
  } catch (error: any) {
    console.error('❌ Create task error:', error);
    console.error('❌ Error message:', error.message);
    return { success: false, error: 'Failed to create task' };
  }
}

// ==================== UPDATE TASK (GURU) ====================
export async function updateTask(
  taskId: number,
  formData: {
    judul?: string;
    deskripsi?: string;
    deadline?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'guru' && session.user.role !== 'admin') {
      return { success: false, error: 'Only teachers and admins can update tasks' };
    }

    // Check if user is the creator OR is admin
    const [taskRows] = await db.query<RowDataPacket[]>(
      'SELECT courseId, createdBy FROM tugas WHERE id = ?',
      [taskId]
    );

    if (taskRows.length === 0) {
      return { success: false, error: 'Task not found' };
    }

    const isCreator = taskRows[0].createdBy === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return { success: false, error: 'Forbidden: You can only edit your own tasks' };
    }

    console.log('📝 Updating task:', taskId, 'with data:', {
      judul: formData.judul,
      hasFile: !!formData.fileUrl,
      fileUrl: formData.fileUrl,
      fileName: formData.fileName,
      fileSize: formData.fileSize
    });

    const updates: string[] = [];
    const values: any[] = [];

    if (formData.judul !== undefined) {
      updates.push('judul = ?');
      values.push(formData.judul);
    }
    if (formData.deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      values.push(formData.deskripsi);
    }
    if (formData.deadline !== undefined) {
      updates.push('deadline = ?');
      values.push(formData.deadline);
    }
    
    // ✅ PENTING: Hanya update file fields jika ada nilai baru
    if (formData.fileUrl !== undefined) {
      updates.push('fileUrl = ?');
      values.push(formData.fileUrl);
      console.log('📎 Updating fileUrl:', formData.fileUrl);
    }
    if (formData.fileName !== undefined) {
      updates.push('fileName = ?');
      values.push(formData.fileName);
      console.log('📎 Updating fileName:', formData.fileName);
    }
    if (formData.fileSize !== undefined) {
      updates.push('fileSize = ?');
      values.push(formData.fileSize);
      console.log('📎 Updating fileSize:', formData.fileSize);
    }

    if (updates.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    values.push(taskId);

    await db.query(
      `UPDATE tugas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log('✅ Task updated successfully');

    // ✅ Verify the updated data
    const [verifyRows] = await db.query<RowDataPacket[]>(
      'SELECT id, judul, fileUrl, fileName, fileSize FROM tugas WHERE id = ?',
      [taskId]
    );

    if (verifyRows.length > 0) {
      console.log('✅ Verified updated task:', {
        id: verifyRows[0].id,
        judul: verifyRows[0].judul,
        fileUrl: verifyRows[0].fileUrl,
        fileName: verifyRows[0].fileName,
        fileSize: verifyRows[0].fileSize
      });
    }

    revalidatePath(`/user/course/${taskRows[0].courseId}`);
    revalidatePath(`/admin/course/${taskRows[0].courseId}`);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Update task error:', error);
    console.error('❌ Error message:', error.message);
    return { success: false, error: 'Failed to update task' };
  }
}


// ==================== DELETE TASK (GURU) ====================
export async function deleteTask(taskId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'guru' && session.user.role !== 'admin') {
      return { success: false, error: 'Only teachers and admins can delete tasks' };
    }

    // Check if user is the creator OR is admin
    const [taskRows] = await db.query<RowDataPacket[]>(
      'SELECT courseId, createdBy FROM tugas WHERE id = ?',
      [taskId]
    );

    if (taskRows.length === 0) {
      return { success: false, error: 'Task not found' };
    }

    const isCreator = taskRows[0].createdBy === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return { success: false, error: 'Forbidden: You can only delete your own tasks' };
    }

    await db.query('DELETE FROM tugas WHERE id = ?', [taskId]);

    console.log('✅ Task deleted:', taskId);

    revalidatePath(`/user/course/${taskRows[0].courseId}`);
    revalidatePath(`/admin/course/${taskRows[0].courseId}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Delete task error:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

// ==================== SUBMIT TASK (SISWA) - FIXED ====================
export async function submitTask(formData: {
  tugasId: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log('📝 Submit task started:', {
      tugasId: formData.tugasId,
      userId: session.user.id,
      fileName: formData.fileName
    });

    // ✅ FIXED: Get siswaId via JOIN
    const [userRows] = await db.query<RowDataPacket[]>(
      `SELECT s.id as siswaId
       FROM users u
       INNER JOIN siswa s ON u.id = s.userId
       WHERE u.id = ?`,
      [session.user.id]
    );

    if (userRows.length === 0) {
      console.error('❌ Student not found for userId:', session.user.id);
      return { success: false, error: 'Student not found' };
    }

    const siswaId = userRows[0].siswaId;
    console.log('✅ Found siswaId:', siswaId);

    // Check if task exists and get deadline
    const [taskRows] = await db.query<RowDataPacket[]>(
      'SELECT id, deadline, courseId FROM tugas WHERE id = ?',
      [formData.tugasId]
    );

    if (taskRows.length === 0) {
      console.error('❌ Task not found:', formData.tugasId);
      return { success: false, error: 'Task not found' };
    }

    const task = taskRows[0];
    const deadline = new Date(task.deadline);
    const now = new Date();
    const status = now > deadline ? 'late' : 'submitted';
    
    console.log('⏰ Deadline check:', {
      deadline: deadline.toISOString(),
      now: now.toISOString(),
      isPastDeadline: now > deadline,
      status: status
    });

    // Insert or update submission
    await db.query(
      `INSERT INTO tugasSelesai 
      (tugasId, siswaId, fileUrl, fileName, fileSize, status, submittedAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        fileUrl = VALUES(fileUrl),
        fileName = VALUES(fileName),
        fileSize = VALUES(fileSize),
        status = VALUES(status),
        submittedAt = NOW()`,
      [
        formData.tugasId,
        siswaId,
        formData.fileUrl,
        formData.fileName,
        formData.fileSize,
        status
      ]
    );

    console.log('✅ Submission saved successfully');

    revalidatePath(`/siswa/course/${task.courseId}`);

    return { 
      success: true, 
      status,
      message: status === 'late' 
        ? 'Tugas berhasil dikumpulkan (Terlambat)' 
        : 'Tugas berhasil dikumpulkan'
    };

  } catch (error: any) {
    console.error('❌ Submit task error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error SQL:', error.sql);
    return { success: false, error: 'Failed to submit task' };
  }
}

// ==================== UPDATE SUBMISSION (SISWA) - FIXED ====================
export async function updateSubmission(
  submissionId: number,
  formData: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    console.log('📝 Update submission started:', {
      submissionId,
      userId: session.user.id
    });

    // ✅ FIXED: Get siswaId via JOIN
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

    // Check if submission exists and belongs to student
    const [submissionRows] = await db.query<RowDataPacket[]>(
      `SELECT ts.siswaId, ts.tugasId, t.deadline, t.courseId 
      FROM tugasSelesai ts
      INNER JOIN tugas t ON ts.tugasId = t.id
      WHERE ts.id = ?`,
      [submissionId]
    );

    if (submissionRows.length === 0) {
      console.error('❌ Submission not found:', submissionId);
      return { success: false, error: 'Submission not found' };
    }

    if (submissionRows[0].siswaId !== siswaId) {
      console.error('❌ Forbidden: Submission does not belong to student');
      return { success: false, error: 'Forbidden' };
    }

    const submission = submissionRows[0];
    const deadline = new Date(submission.deadline);
    const now = new Date();
    const status = now > deadline ? 'late' : 'submitted';

    // Update submission
    await db.query(
      `UPDATE tugasSelesai 
      SET fileUrl = ?, fileName = ?, fileSize = ?, status = ?, submittedAt = NOW()
      WHERE id = ?`,
      [
        formData.fileUrl,
        formData.fileName,
        formData.fileSize,
        status,
        submissionId
      ]
    );

    console.log('✅ Submission updated successfully');

    revalidatePath(`/siswa/course/${submission.courseId}`);

    return { 
      success: true, 
      status,
      message: status === 'late' 
        ? 'Pengumpulan berhasil diupdate (Terlambat)' 
        : 'Pengumpulan berhasil diupdate'
    };

  } catch (error: any) {
    console.error('Update submission error:', error);
    console.error(' Error message:', error.message);
    return { success: false, error: 'Failed to update submission' };
  }
}


// ==================== GET TASK FILE URL (FOR DOWNLOAD) ====================
export async function getTaskFileUrl(taskId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT fileUrl, fileName FROM tugas WHERE id = ?',
      [taskId]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Task not found' };
    }

    if (!rows[0].fileUrl) {
      console.log('⚠️ No file attached to task:', taskId);
      return { success: false, error: 'No file available' };
    }

    console.log('✅ File found for task:', taskId, '- URL:', rows[0].fileUrl);

    return {
      success: true,
      data: {
        fileUrl: rows[0].fileUrl,
        fileName: rows[0].fileName
      }
    };
  } catch (error) {
    console.error('❌ Get task file error:', error);
    return { success: false, error: 'Failed to get file' };
  }
}

