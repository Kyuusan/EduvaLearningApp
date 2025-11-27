import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  getSiswaByUserId,
  getGuruByUserId,
  getAdminByUserId,
  updateGuruPassword,
  updateAdminPassword,
  type Siswa,
  type Guru,
  type Admin,
} from "../../../../../lib/action";

export interface AuthUser {
  id: number;
  email: string;
  nama: string;
  role: "siswa" | "guru" | "admin";
  roleId: number;
  nisn?: string;
  kelas?: string;
  jurusan?: "RPL" | "TJKT" | "PSPT" | "ANIM";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        try {
          const user = await getUserByEmail(credentials.email);
          if (!user) throw new Error("Email tidak terdaftar");

          let userData: Siswa | Guru | Admin | null = null;
          let passwordToVerify = "";
          let shouldMigratePassword = false;

          // Ambil data berdasarkan role
          if (user.role === "siswa") {
            userData = await getSiswaByUserId(user.id);
            if (!userData) throw new Error("Data siswa tidak ditemukan");

            // Cek approval
            if (userData.accses === "no") {
              throw new Error("Akun Anda masih menunggu persetujuan admin");
            }

            passwordToVerify = userData.password;
          } else if (user.role === "guru") {
            userData = await getGuruByUserId(user.id);
            if (!userData) throw new Error("Data guru tidak ditemukan");
            passwordToVerify = userData.password;
          } else if (user.role === "admin") {
            userData = await getAdminByUserId(user.id);
            if (!userData) throw new Error("Data admin tidak ditemukan");
            passwordToVerify = userData.password;
          }

          if (!userData) throw new Error("Data user tidak ditemukan");

          // ========== HYBRID PASSWORD VERIFICATION ==========
          let isPasswordValid = false;

          // Cek apakah password di database sudah di-hash
          // Bcrypt hash selalu dimulai dengan $2a$, $2b$, atau $2y$
          const isPasswordHashed = passwordToVerify.startsWith("$2a$") || 
                                   passwordToVerify.startsWith("$2b$") || 
                                   passwordToVerify.startsWith("$2y$");

          console.log(" DEBUG LOGIN:");
          console.log("   Email:", user.email);
          console.log("   Role:", user.role);
          console.log("   Input Password:", credentials.password);
          console.log("   DB Password:", passwordToVerify.substring(0, 20) + "...");
          console.log("   Is Hashed?:", isPasswordHashed);

          if (isPasswordHashed) {
            // Password sudah di-hash, gunakan bcrypt compare
            isPasswordValid = await bcrypt.compare(
              credentials.password,
              passwordToVerify
            );
            console.log("   Bcrypt Compare:", isPasswordValid);
          } else {
            // Password masih plain text, compare langsung
            isPasswordValid = credentials.password === passwordToVerify;
            console.log("   Plain Compare:", isPasswordValid);
            
            // Tandai untuk migrasi ke hash
            if (isPasswordValid) {
              shouldMigratePassword = true;
              console.log("    Password needs migration");
            }
          }

          if (!isPasswordValid) {
            console.log("    Password validation FAILED");
            throw new Error("Password salah");
          }

          console.log("    Password validation SUCCESS");

          // ========== AUTO-MIGRATE PLAIN TEXT TO HASH ==========
          if (shouldMigratePassword) {
            try {
              const hashedPassword = await bcrypt.hash(credentials.password, 10);
              console.log("    Hashing password...");
              
              if (user.role === "guru" && "guruId" in userData) {
                await updateGuruPassword(userData.guruId, hashedPassword);
                console.log("    Guru password migrated to hash");
              } else if (user.role === "admin") {
                await updateAdminPassword(userData.id, hashedPassword);
                console.log("    Admin password migrated to hash");
              }
            } catch (migrationError) {
              // Login tetap berhasil meski migrasi gagal
              console.error("   Password migration failed:", migrationError);
            }
          }

          // Build auth user object
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            nama: userData.nama,
            role: user.role,
            roleId: "guruId" in userData ? userData.guruId : userData.id,
          };

          // Tambahkan data khusus siswa
          if (user.role === "siswa" && "nisn" in userData) {
            authUser.nisn = userData.nisn;
            authUser.kelas = userData.kelas;
            authUser.jurusan = userData.jurusan;
          }

          return authUser;
        } catch (error) {
          console.error("❌ Auth error:", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.nama = user.nama;

        if (user.role === "siswa") {
          token.nisn = user.nisn;
          token.kelas = user.kelas;
          token.jurusan = user.jurusan;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as "siswa" | "guru" | "admin";
        session.user.roleId = token.roleId as number;
        session.user.nama = token.nama as string;

        if (token.role === "siswa") {
          session.user.nisn = token.nisn as string;
          session.user.kelas = token.kelas as string;
          session.user.jurusan = token.jurusan as
            | "RPL"
            | "TJKT"
            | "PSPT"
            | "ANIM";
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/masuk",
    error: "/auth/masuk",
  },

  session: {
    strategy: "jwt",
    maxAge: 6048000,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };