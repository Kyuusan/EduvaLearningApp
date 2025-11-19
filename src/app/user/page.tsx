import type { Metadata } from "next";
import React from "react";
import {LMSDashboardMetrics }from "@/components/dashboard/LmsDashboardTugas";
import VisiMisiCard from "@/components/dashboard/MonthlySalesChart";
import ListTugasSiswa from "@/components/user/homePage/listTugasSiswa";
import { Rubik } from "next/font/google";
import MapelCard from "@/components/user/courseCard";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 xl:auto-rows-fr">


      {/* Kiri */}
      <div className="xl:col-span-7 flex flex-col gap-4 md:gap-6 min-h-0">
        <LMSDashboardMetrics />
        <VisiMisiCard />
      </div>

      {/* Kanan */}
      <div className="xl:col-span-5 self-strech ">
        <div className="h-full max-h-full overflow-y-auto">
          <ListTugasSiswa />
        </div>
      </div>

    </div>
    <div className="w-full py-10">
      <h1 className={` ${rubik.className} text-2xl font-bold`}>Riwayat Belajar</h1>
    </div>
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <MapelCard
          namaMapel="Matematika"
          kategori="umum"
          kelas={["X PPLG 1", "X PPLG 2"]}
        />
        <MapelCard
          namaMapel="Pemrograman Web"
          kategori="kejuruan"
          kelas={["XI PPLG 1", "XI PPLG 2", "XI PPLG 3"]}
        />
        <MapelCard
          namaMapel="Bahasa Indonesia"
          kategori="umum"
          kelas={["X PPLG 1"]}
        />
    </div>
    </>
  );
}