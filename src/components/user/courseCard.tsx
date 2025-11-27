"use client"

import React from 'react';
import Image from 'next/image';
import { ChevronRight} from 'lucide-react';
import { Poppins, Rubik } from 'next/font/google';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

interface MapelCardProps {
  namaMapel: string;
  kategori: 'umum' | 'kejuruan';
  kelas: string[];  
  deskripsi?: string;
  imageUrl?: string;
  courseId: number;
  onClick?: () => void; // 
  onEdit?: () => void;  //
  onDelete?: () => void; //
}

export interface Course {
  id: number;
  guruId: number | null;
  adminId: number | null;
  nama: string;
  deskripsi: string;
  kategori: "Umum" | "Kejuruan";
  tingkat: "X" | "XI" | "XII";
  imageUrl: string;
  createdAt: Date;
  enrolledKelas?: Array<{
    kelasId: number;
    kelasNama: string;
  }>;
}

export interface CourseHistory extends Course {
  kelasNama?: string;
  lastAccessedAt: Date | string;
  accessCount: number;
}

function MapelCard({ 
  namaMapel = "contoh", 
  kategori, 
  kelas = [" "],
  deskripsi = "Pelajari materi dan kerjakan tugas dengan baik ya woi pokoknya begitu dah",
  imageUrl = '/og.jpg',
  onClick,
 
}: MapelCardProps) {
  
  const kategoriColor = kategori === 'umum' 
    ? 'bg-blue-500' 
    : 'bg-purple-500';
    
  const kategoriText = kategori === 'umum' 
    ? 'Umum' 
    : 'Kejuruan';

  // Display logic for classes
  const displayClasses = kelas.length <= 2 
    ? kelas.join(', ') 
    : `${kelas.slice(0, 2).join(', ')} +${kelas.length - 2}`;

  return (
    <div 
      onClick={onClick} // ✅ Handle click untuk navigate
      className={`w-full max-w-[400px] h-[420px] group mx-auto dark:bg-[#252525] p-2 bg-white dark:border-0 border overflow-hidden rounded-md dark:text-white text-black ${onClick ? 'cursor-pointer' : ''}`}
    >
      <figure className='w-full h-60 group-hover:h-52 transition-all duration-300 dark:bg-[#0a121a] bg-[#f0f5fa] p-2 rounded-md relative overflow-hidden'>
        <div
          style={{
            background:
              'linear-gradient(123.9deg, #0B65ED 1.52%, rgba(0, 0, 0, 0) 68.91%)',
          }}
          className='absolute top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0 transition-all duration-300'
        ></div>
        <Image
          src={imageUrl}
          alt={namaMapel}
          width={600}
          height={600}
          className='absolute -bottom-1 group-hover:-bottom-5 right-0 h-64 w-[80%] group-hover:border-4 border-4 group-hover:border-[#76aaf82d] rounded-lg object-cover transition-all duration-300'
        />
        
        {/* Badge Kelas dengan Tooltip */}
        <div className='absolute top-2 left-2 group/badge'>
          <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-800 dark:text-white shadow-sm cursor-help ${poppins.className}`}>
            {displayClasses}
          </div>
          
          {/* Tooltip untuk menampilkan semua kelas saat hover */}
          {kelas.length > 2 && (
            <div className={`absolute top-full left-0 mt-2 w-52 max-h-64 overflow-y-auto z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 ${poppins.className}`}>
              <p className='text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300 sticky top-0 bg-white dark:bg-gray-800 pb-1'>Semua Kelas:</p>
              <div className='flex flex-wrap gap-1.5'>
                {kelas.map((kelasItem, index) => (
                  <span 
                    key={index}
                    className='text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md'
                  >
                    {kelasItem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </figure>
      
      <article className={`p-4 space-y-2 ${poppins.className}`}>
        {/* Kategori Badge */}
        <div className={`h-8 w-fit px-3 ${kategoriColor} rounded-md flex items-center justify-center`}>
          <span className='text-white text-sm font-medium'>{kategoriText}</span>
        </div>
        
        {/* Nama Mapel */}
        <h1 className={`text-xl font-semibold capitalize ${rubik.className}`}>
          {namaMapel}
        </h1>
        
        {/* Deskripsi */}
        <p className='text-sm text-gray-600 dark:text-gray-400 leading-snug line-clamp-2'>
          {deskripsi}
        </p>
        
        {/* Link Button - Hanya muncul saat hover */}
        <button
          onClick={(e) => {
            if (onClick) {
              e.stopPropagation(); // Prevent double trigger
              onClick();
            }
          }}
          className='text-base dark:text-white text-blue-600 font-normal group-hover:opacity-100 opacity-0 translate-y-2 group-hover:translate-y-0 pt-2 flex gap-1 transition-all duration-300 hover:text-blue-700 dark:hover:text-blue-300'
        >
          Lihat Materi
          <span>
            <ChevronRight />
          </span>
        </button>
      </article>
    </div>
  );
}

export default MapelCard;