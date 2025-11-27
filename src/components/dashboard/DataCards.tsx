"use client";
import React, { useEffect, useState } from "react";
import { FileText, User, BookOpen } from "lucide-react";
import { Rubik } from "next/font/google";
import Badge from "../ui/badge/Badge";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const DataCards = () => {
  const [stats, setStats] = useState({
    totalTugas: 0,
    totalSiswa: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              totalTugas: data.totalTugas || 0,
              totalSiswa: data.totalSiswa || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6 ${rubik.className}`}>
        {/* Total Semua Tugas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
            <FileText className="text-blue-600 size-6 dark:text-blue-400" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tugas Dibuat
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
                {loading ? "..." : stats.totalTugas}
              </h4>
            </div>
            <Badge color="info">
              <BookOpen className="size-3" />
              Aktif
            </Badge>
          </div>
        </div>

        {/* Murid yang Bergabung */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
            <User className="text-green-600 size-6 dark:text-green-400" />
          </div>
          
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Murid yang bergabung
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
                {loading ? "..." : stats.totalSiswa}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};