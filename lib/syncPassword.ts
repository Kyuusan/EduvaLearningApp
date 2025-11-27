// lib/syncPassword.ts

import db from "./db";
import bcrypt from "bcryptjs";
import { PoolConnection, RowDataPacket } from "mysql2/promise";

/**
 * Verifikasi password dengan auto-conversion dari plain text ke hash
 * Fungsi ini akan:
 * 1. Cek apakah password di DB adalah plain text atau hash
 * 2. Jika plain text dan cocok dengan input, convert ke hash
 * 3. Sync hash ke semua tabel terkait
 * 4. Return hasil verifikasi
 */
export async function verifyPasswordWithSync(
  userId: number,
  role: string,
  passwordToVerify: string,
  connection?: PoolConnection
): Promise<{ isValid: boolean; currentHash: string | null }> {
  try {
    const conn = connection || db;
    
    // Ambil password dari tabel users (sumber utama)
    const [userRows] = await conn.query<RowDataPacket[]>(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );
    
    if (!userRows || userRows.length === 0) {
      console.error(`User not found: userId=${userId}`);
      return { isValid: false, currentHash: null };
    }
    
    const storedPassword = userRows[0].password as string;
    
    // Cek apakah password adalah hash bcrypt (dimulai dengan $2a$ atau $2b$ atau $2y$)
    const isHashed = storedPassword.startsWith('$2');
    
    console.log(`Password check for userId=${userId}, role=${role}, isHashed=${isHashed}`);
    
    if (isHashed) {
      // Password sudah di-hash, verifikasi normal
      const isValid = await bcrypt.compare(passwordToVerify, storedPassword);
      
      if (isValid) {
        // Pastikan password di-sync ke tabel role-specific
        await syncHashedPassword(userId, role, storedPassword, conn);
      }
      
      return { isValid, currentHash: storedPassword };
      
    } else {
      // Password masih plain text
      console.log(`Plain text password detected for userId=${userId}`);
      
      // Verifikasi dengan perbandingan string langsung
      const isValid = passwordToVerify === storedPassword;
      
      if (isValid) {
        console.log(`Plain text password matches, converting to hash...`);
        
        // Convert plain text ke hash
        const hashedPassword = await bcrypt.hash(passwordToVerify, 10);
        
        // Update password ke hash di semua tabel
        await updatePasswordEverywhere(userId, role, hashedPassword, conn);
        
        console.log(`Password converted and synced for userId=${userId}`);
        
        return { isValid: true, currentHash: hashedPassword };
      } else {
        console.log(`Plain text password does not match for userId=${userId}`);
        return { isValid: false, currentHash: null };
      }
    }
    
  } catch (error) {
    console.error("Error in verifyPasswordWithSync:", error);
    return { isValid: false, currentHash: null };
  }
}

/**
 * Sync password yang sudah di-hash ke tabel role-specific
 */
async function syncHashedPassword(
  userId: number,
  role: string,
  hashedPassword: string,
  connection: PoolConnection | typeof db
) {
  try {
    if (role === "guru") {
      const [guruRows] = await connection.query<RowDataPacket[]>(
        "SELECT guruId, password FROM guru WHERE userId = ?",
        [userId]
      );
      
      if (guruRows && guruRows.length > 0) {
        const guru = guruRows[0];
        
        // Jika password guru berbeda dengan users, sync
        if (guru.password !== hashedPassword) {
          await connection.execute(
            "UPDATE guru SET password = ? WHERE guruId = ?",
            [hashedPassword, guru.guruId]
          );
          console.log(`Password synced to guru table for userId: ${userId}`);
        }
      }
    } else if (role === "admin") {
      const [adminRows] = await connection.query<RowDataPacket[]>(
        "SELECT id, password FROM admin WHERE userId = ?",
        [userId]
      );
      
      if (adminRows && adminRows.length > 0) {
        const admin = adminRows[0];
        
        // Jika password admin berbeda dengan users, sync
        if (admin.password !== hashedPassword) {
          await connection.execute(
            "UPDATE admin SET password = ? WHERE id = ?",
            [hashedPassword, admin.id]
          );
          console.log(`Password synced to admin table for userId: ${userId}`);
        }
      }
    } else if (role === "siswa") {
      const [siswaRows] = await connection.query<RowDataPacket[]>(
        "SELECT siswaId, password FROM siswa WHERE userId = ?",
        [userId]
      );
      
      if (siswaRows && siswaRows.length > 0) {
        const siswa = siswaRows[0];
        
        // Jika password siswa berbeda dengan users, sync
        if (siswa.password !== hashedPassword) {
          await connection.execute(
            "UPDATE siswa SET password = ? WHERE siswaId = ?",
            [hashedPassword, siswa.siswaId]
          );
          console.log(`Password synced to siswa table for userId: ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error("Error syncing hashed password:", error);
  }
}

/**
 * Update password di semua tabel terkait
 * Digunakan saat change password atau convert plain text ke hash
 */
export async function updatePasswordEverywhere(
  userId: number,
  role: string,
  newHashedPassword: string,
  connection?: PoolConnection | typeof db
) {
  try {
    const conn = connection || db;
    
    // Update di tabel users (sumber utama)
    await conn.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [newHashedPassword, userId]
    );
    console.log(`Password updated in users table for userId: ${userId}`);
    
    // Update di tabel role-specific
    if (role === "guru") {
      await conn.execute(
        "UPDATE guru SET password = ? WHERE userId = ?",
        [newHashedPassword, userId]
      );
      console.log(`Password updated in guru table for userId: ${userId}`);
    } else if (role === "admin") {
      await conn.execute(
        "UPDATE admin SET password = ? WHERE userId = ?",
        [newHashedPassword, userId]
      );
      console.log(`Password updated in admin table for userId: ${userId}`);
    } else if (role === "siswa") {
      await conn.execute(
        "UPDATE siswa SET password = ? WHERE userId = ?",
        [newHashedPassword, userId]
      );
      console.log(`Password updated in siswa table for userId: ${userId}`);
    }
    
    console.log(`Password updated everywhere for userId: ${userId}, role: ${role}`);
  } catch (error) {
    console.error("Error updating password everywhere:", error);
    throw error;
  }
}


