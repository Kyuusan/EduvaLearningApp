import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: 'siswa' | 'guru' | 'admin';
      roleId: number;
      nama: string;
      email: string;
      // Data khusus siswa
      nisn?: string;
      kelas?: string;
      jurusan?: 'RPL' | 'TJKT' | 'PSPT' | 'ANIM';
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: 'siswa' | 'guru' | 'admin';
    roleId: number;
    nama: string;
    email: string;
    nisn?: string;
    kelas?: string;
    jurusan?: 'RPL' | 'TJKT' | 'PSPT' | 'ANIM';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: 'siswa' | 'guru' | 'admin';
    roleId: number;
    nama: string;
    nisn?: string;
    kelas?: string;
    jurusan?: 'RPL' | 'TJKT' | 'PSPT' | 'ANIM';
  }
}