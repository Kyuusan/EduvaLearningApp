// app/api/admin/manageUser/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "../../../../../lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// GET - Fetch all users untuk approval
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    // Query untuk mendapatkan data siswa
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        s.userid as userId,
        s.nisn,
        s.nama,
        s.kelas,
        s.jurusan,
        u.email,
        s.accses as access,
        s.createdAt as registeredAt
      FROM siswa s
      INNER JOIN users u ON s.userid = u.id
      WHERE u.role = 'siswa'
      ORDER BY 
        CASE WHEN s.accses = 'no' THEN 0 ELSE 1 END,
        s.createdAt DESC`
    );

    const users = rows.map(row => ({
      userId: row.userId,
      nisn: row.nisn,
      nama: row.nama,
      kelas: row.kelas || '-',
      jurusan: row.jurusan || '-',
      email: row.email,
      access: row.access === 'yes',
      registeredAt: row.registeredAt
    }));

    return NextResponse.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error("Error fetching users for approval:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Approve or Revoke user access
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: "userId and action are required" },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'revoke') {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'approve' or 'revoke'" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Update access di tabel siswa (ENUM 'yes' atau 'no')
      const newAccessValue = action === 'approve' ? 'yes' : 'no';
      
      const [result] = await connection.execute<ResultSetHeader>(
        "UPDATE siswa SET accses = ? WHERE userid = ?",
        [newAccessValue, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error("User not found");
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: action === 'approve' 
          ? "User access approved successfully" 
          : "User access revoked successfully"
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error updating user access:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Delete dari tabel siswa terlebih dahulu (karena ada foreign key)
      const [result] = await connection.execute<ResultSetHeader>(
        "DELETE FROM siswa WHERE userid = ?",
        [userId]
      );

      if (result.affectedRows === 0) {
        throw new Error("User not found");
      }

      // Delete dari tabel users
      await connection.execute<ResultSetHeader>(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "User deleted successfully"
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}