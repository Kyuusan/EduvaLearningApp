"use client";
import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Poppins, Rubik } from 'next/font/google';
import { 
  SketchAccordion, 
  SketchAccordionItem, 
  SketchAccordionTrigger, 
  SketchAccordionContent 
} from "@/components/user/accordition";
import Link from 'next/link';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'completed' | 'pending';
}

const dummyTasks: Task[] = [
  {
    id: 1,
    title: "Toleransi",
    description: "Buatlah essay tentang pentingnya toleransi dalam kehidupan beragama di Indonesia",
    deadline: "2025-11-20",
    status: "completed"
  },
  {
    id: 2,
    title: "Iman, Islam dan Ihsan - Memelihara Lisan dan Menutup aib orang lain",
    description: "Analisis hadist tentang menjaga lisan dan menutupi aib orang lain dengan contoh konkret",
    deadline: "2025-11-25",
    status: "pending"
  },
  {
    id: 3,
    title: "Kuis Materi Toleransi",
    description: "Kerjakan kuis online tentang materi toleransi beragama",
    deadline: "2025-11-18",
    status: "completed"
  },
  {
    id: 4,
    title: "Akhlak Terpuji dalam Kehidupan Sehari-hari",
    description: "Buat video presentasi tentang penerapan akhlak terpuji dalam kehidupan sehari-hari",
    deadline: "2025-11-30",
    status: "pending"
  },
  {
    id: 5,
    title: "Hukum Islam tentang Muamalah",
    description: "Ringkas dan jelaskan konsep muamalah dalam Islam beserta contohnya",
    deadline: "2025-12-05",
    status: "pending"
  }
];

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');

  const courseTitle = "Pendidikan Agama Islam";
  const enrolledClasses = ["XI RPL 1", "XI RPL 2", "XI RPL 3", "XI RPL 4", "XI RPL 5", "XI PSPT 1", "XI PSPT 2", "XI PSPT 3"];

  const filteredTasks = dummyTasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });



  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-4xl font-bold text-gray-900 dark:text-white font-rubik mb-3 ${rubik.className}`}>
            {courseTitle}
          </h1>
          <div className="flex flex-wrap gap-2">
            {enrolledClasses.slice(0, 3).map((kelas, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium font-poppins"
              >
                {kelas}
              </span>
            ))}
            {enrolledClasses.length > 3 && (
              <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium font-poppins">
                +{enrolledClasses.length - 3} kelas lainnya
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">

           
            <button className="px-6 py-3 text-sm font-medium font-poppins text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
              Materi
            </button>

            <button className="px-6 py-3 text-sm font-medium font-poppins text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Peserta
            </button>
          </div>
        </div>

       
        {/* General Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={` ${rubik.className} text-xl font-bold text-blue-500 `}>
              Tambah Tugas
            </h2>
          </div>

          <div className="p-4 flex justify-between">
           <h1 className={`${poppins.className} text-base font-semibold dark:text-white`}>Nama Guru</h1>
            <button className={`${poppins.className} flex gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700  text-white font-medium rounded-lg text-sm transition-colors duration-300 ease-out`}>
                      Tambah Tugas <span><Plus className='w-[18px] h-auto' strokeWidth={3}/></span>
                    </button>
          </div>
        </div>

        {/* Tasks Accordion */}
        <SketchAccordion type="single" collapsible className="space-y-3">
          {filteredTasks.map((task, index) => (
            <SketchAccordionItem key={task.id} value={`task-${task.id}`}>
              <SketchAccordionTrigger>
                <div className={`${poppins.className} flex items-center justify-between w-full pr-4 py-4`}>
                  <span className={`lg:text-xl text-lg text-left font-semibold text-gray-900 dark:text-white ${rubik.className}`}>
                    {index + 1}. {task.title}
                  </span>
                  {task.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium font-poppins">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium font-poppins">
                      <XCircle className="w-3.5 h-3.5" />
                      Belum
                    </span>
                  )}
                </div>
              </SketchAccordionTrigger>
              <SketchAccordionContent>
                <div className="space-y-4">
                  <p className={`text-base text-gray-600 dark:text-gray-300 font-poppins ${poppins.className}`}>
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-poppins">
                    <Calendar className="w-4 h-4" />
                    <span>Batas Waktu: {new Date(task.deadline).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>

                  <div className={`flex gap-3 ${poppins.className}`}>
                   <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium font-poppins transition-colors">
                       Buka Materi
                      </button>
                    {task.status === 'pending' ? (

                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium font-poppins transition-colors">
                      Kumpulkan Tugas
                    </button>
                    ): (
                      <div className='flex gap-3'>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed text-sm font-medium  transition-colors">
                      Tugas Telah Dikumpulkan
                    </button>
                      <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium  transition-colors">
                      Edit Tugas
                    </button>

                      </div>
                    )}
                  </div>
                </div>
              </SketchAccordionContent>
            </SketchAccordionItem>
          ))}
        </SketchAccordion>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-poppins">
              Tidak ada tugas yang {activeTab === 'completed' ? 'sudah dikerjakan' : 'belum dikerjakan'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}