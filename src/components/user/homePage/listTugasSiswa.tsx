"use client";
import { ListTugas } from "./OrderTugas";

export default function ListTugasSiswa() {
  const dummyTugasData = [
    {
      id: 1,
      tittle: "Tugas Matematika - Persamaan Kuadrat",
      desc: "Kerjakan soal latihan halaman 45-47 tentang persamaan kuadrat dan fungsi kuadrat",
      deadline: "Deadline: 20 November 2025",
      link: "https://classroom.google.com/tugas-1"
    },
    {
      id: 2,
      tittle: "Essay Bahasa Indonesia - Teks Argumentasi",
      desc: "Buatlah essay argumentasi dengan tema 'Pentingnya Literasi Digital di Era Modern' minimal 500 kata",
      deadline: "Deadline: 22 November 2025",
      link: "https://classroom.google.com/tugas-2"
    },
    {
      id: 3,
      tittle: "Presentasi Kelompok Biologi",
      desc: "Persiapkan presentasi tentang sistem pencernaan manusia, durasi 15 menit per kelompok",
      deadline: "Deadline: 25 November 2025"
    },
    {
      id: 4,
      tittle: "Presentasi Kelompok Biologi",
      desc: "Persiapkan presentasi tentang sistem pencernaan manusia, durasi 15 menit per kelompok",
      deadline: "Deadline: 25 November 2025"
    },
    {
      id: 5,
      tittle: "Presentasi Kelompok Biologi",
      desc: "Persiapkan presentasi tentang sistem pencernaan manusia, durasi 15 menit per kelompok",
      deadline: "Deadline: 25 November 2025"
    },
    {
      id: 6,
      tittle: "Presentasi Kelompok Biologi",
      desc: "Persiapkan presentasi tentang sistem pencernaan manusia, durasi 15 menit per kelompok",
      deadline: "Deadline: 25 November 2025"
    },

 
  ];

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

  <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
    <ListTugas items={dummyTugasData} />
  </div>

</div>

);
}