"use client";

import React, { useEffect, useState, useCallback } from "react"; 
import { FileText, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import { Rubik } from "next/font/google";
import Badge from "@/components/ui/badge/Badge";
import { getDashboardMetrics } from "../../../lib/userHome.action";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export const LMSDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDashboardMetrics();
      
      if (result.success && result.data) {
        setMetrics(result.data);
        setError(null); 
      } else {
        setError(result.error || 'Failed to load metrics');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]); 

  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 ${rubik.className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="flex items-end justify-between mt-5">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 ${rubik.className}`}>
        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
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
              {metrics.totalTasks}
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
              {metrics.completedTasks}
            </h4>
          </div>

          <Badge color="success">
            {metrics.completionRate}%
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
              {metrics.completionRate}%
            </h4>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden mt-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${metrics.completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};