"use client";
import React from "react";
import Image from "next/image";
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

export default function UserMetaCard() {
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


  if (status === "loading" || loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Skeleton Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            
            {/* Skeleton Text */}
            <div className="order-3 xl:order-2 space-y-2">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-red-200 rounded-2xl dark:border-red-800 lg:p-6 bg-red-50 dark:bg-red-900/20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Data profil tidak ditemukan
        </p>
      </div>
    );
  }


  return (
    <div className={`p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 ${rubik.className}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Avatar */}
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image
              width={80}
              height={80}
              src="/images/user/owner.jpg"
              alt={profile.nama}
            />
          </div>

          {/* User Info */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {profile.nama}
            </h4>
            
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              
              {profile.jurusan && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile.jurusan}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                </>
              )}
              
              {/* School */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SMK Nanuna Jaya
              </p>
            </div>

            {profile.nisn && (
              <p className={`text-xs text-gray-600 dark:text-gray-500 mt-2 text-center xl:text-left ${poppins.className}`}>
                NISN: {profile.nisn}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}