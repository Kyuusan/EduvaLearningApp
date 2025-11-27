"use client"

import MapelCard from "@/components/user/courseCard"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import type { Course } from "../../../../lib/course.action";
import { Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { Poppins, Rubik } from 'next/font/google';
import { useRouter } from "next/navigation"; 

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const rubik = Rubik({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Course() {
  const router = useRouter();
  const { status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCourseClick = (courseId: number) => {
    router.push(`/user/course/${courseId}`); 
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCourses();
    }
  }, [status]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/course/siswa');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }

      setCourses(data.data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className={`w-full ${poppins.className}`}>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${poppins.className}`}>
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`${rubik.className} text-lg font-bold text-red-700 dark:text-red-400 mb-1`}>
                Gagal Memuat Course
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              <button
                onClick={fetchCourses}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className={`w-full ${poppins.className}`}>
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className={`${rubik.className} text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3`}>
            Belum Ada Course Tersedia
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Saat ini kelas Anda belum terdaftar di course manapun.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Hubungi guru atau admin untuk mendaftarkan kelas Anda ke course.
          </p>
        </div>
      </div>
    );
  }

  // Success state with courses
  return (
    <>
      <div className={`w-full ${poppins.className}`}>
        {/* Header Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`${rubik.className} text-lg font-bold text-gray-800 dark:text-gray-200`}>
                Course Saya
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {courses.length} course tersedia untuk kelas Anda
              </p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {courses.map((course) => (
            <MapelCard
              key={course.id}
              namaMapel={course.nama}
              kategori={course.kategori.toLowerCase() as "umum" | "kejuruan"}
              deskripsi={course.deskripsi}
              kelas={course.enrolledKelas?.map(k => k.kelasNama) || []}
              imageUrl={course.imageUrl}
              courseId={course.id}
              onClick={() => handleCourseClick(course.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}