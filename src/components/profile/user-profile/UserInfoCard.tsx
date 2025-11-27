"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins, Rubik } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik"
});

interface ProfileData {
  id: number;
  nama: string;
  email: string;
  nisn?: string;
  kelas?: string;
  jurusan?: string;
  accses?: string;
  guruId?: number;
  createdAt?: string;
}

export default function UserInfoCard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/masuk");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data profil");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (status === "loading" || loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error/No Data State
  if (error || !profile || !session) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          {error || "Data profil tidak ditemukan"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informasi Pengguna
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {/* Nama Pengguna */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nama Pengguna
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.nama}
              </p>
            </div>

            {/* Peran */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Peran
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {session.user.role === "siswa" ? "Siswa" : session.user.role === "guru" ? "Guru" : "Admin"}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email 
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.email}
              </p>
            </div>

            {/* Kelas (hanya untuk siswa) */}
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Kelas
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.kelas || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}