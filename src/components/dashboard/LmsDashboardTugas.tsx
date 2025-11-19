"use client";
import React from "react";
import { FileText, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import { Rubik } from "next/font/google";
import Badge from "../ui/badge/Badge";


  const rubik = Rubik({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-rubik",
  });


export const LMSDashboardMetrics = () => {
  const totalTasks = 24;
  const completedTasks = 18;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <>

      
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 ${rubik.className}`}>
      {/* Total Semua Tugas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <FileText className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Semua Tugas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
              {totalTasks}
            </h4>
          </div>
          <Badge color="info">
            <BookOpen className="size-3" />
            Aktif
          </Badge>
        </div>
      </div>

      {/* Tugas yang Sudah Dikerjakan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <CheckCircle className="text-green-600 size-6 dark:text-green-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tugas Selesai
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
              {completedTasks}
            </h4>
          </div>

          <Badge color="success">
            {completionRate}%
          </Badge>
        </div>
      </div>

    

      {/* Progress Card */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 dark:border-gray-800 md:p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl dark:bg-indigo-900/30 mb-5">
          <TrendingUp className="text-indigo-600 size-6 dark:text-indigo-400" />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Progress Belajar
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
              {completionRate}%
            </h4>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden mt-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
    </>
    )
}