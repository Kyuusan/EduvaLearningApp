"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { ListTugas, DragItem } from "./OrderTugas";
import { getAllTasksSiswa } from "../../../../lib/userHome.action";

interface TaskSummary {
  id: number;
  courseId: number;
  courseName: string;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  status: 'completed' | 'pending';
  submittedAt?: string;
  submissionStatus?: 'submitted' | 'late';
}

export default function ListTugasSiswa() {
  const [tasks, setTasks] = useState<DragItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const result = await getAllTasksSiswa();
      
      if (result.success && result.data) {
        // Filter hanya tugas pending dan transform ke format DragItem
        const pendingTasks = result.data
          .filter(task => task.status === 'pending')
          .map(task => transformToDragItem(task));
        
        setTasks(pendingTasks);
      } else {
        setError(result.error || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const transformToDragItem = (task: TaskSummary): DragItem => {
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = formatDeadline(deadlineDate);
    
    return {
      id: task.id,
      tittle: `${task.courseName} - ${task.judul}`,
      desc: task.deskripsi || 'Tidak ada deskripsi',
      deadline: `Deadline: ${formattedDeadline}`,
      link: `/siswa/course/${task.courseId}`, // Link ke detail course
      courseId: task.courseId // Extra field untuk navigation
    };
  };

  const formatDeadline = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleReorder = (reorderedItems: DragItem[]) => {
    setTasks(reorderedItems);
    // Optional: Save order to localStorage or backend
    // localStorage.setItem('taskOrder', JSON.stringify(reorderedItems.map(i => i.id)));
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-default 
        dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full xl:max-h-[500px]">
        
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            List Tugas
          </h3>
          <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
            Kerjakan sebelum batas waktu!
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 pb-5 sm:px-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat tugas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-default 
        dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full xl:max-h-[500px]">
        
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            List Tugas
          </h3>
          <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
            Kerjakan sebelum batas waktu!
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 pb-5 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={fetchTasks}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-default 
        dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full xl:max-h-[500px]">
        
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            List Tugas
          </h3>
          <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
            Kerjakan sebelum batas waktu!
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 pb-5 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
              <svg 
                className="w-12 h-12 text-green-600 dark:text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white/90">
                Tidak ada tugas pending
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Semua tugas sudah selesai! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-default 
      dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full xl:max-h-[500px]">

      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              List Tugas
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-sm dark:text-gray-400">
              Kerjakan sebelum batas waktu!
            </p>
          </div>
          <span className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {tasks.length} Tugas
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
        <ListTugas items={tasks} onReorder={handleReorder} />
      </div>
    </div>
  );
}