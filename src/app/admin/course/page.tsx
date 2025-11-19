"use client"
import MapelCard from "@/components/user/courseCard"
import React, { useState } from 'react';
import { ModalContent, FramerModal } from '@/components/user/dialog';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { MultiSelect } from "@/components/user/multiSelector";
import { Poppins, Rubik } from 'next/font/google';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent 
} from '@/components/user/dropdown';

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

interface FormDataType {
  nama: string;
  kategori: string;
  deskripsi: string;
  imageLink: string;
  tingkatKelas: 'X' | 'XI' | 'XII';
  kelasTerpilih: string[];
}

export default function Course() {
  const [modalOpen, setModalOpen] = useState(false);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [tingkatKelasOpen, setTingkatKelasOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>({
    nama: '',
    kategori: '',
    deskripsi: '',
    imageLink: '',
    tingkatKelas: 'X',
    kelasTerpilih: []
  });

  // Format options untuk MultiSelect component
  const kelasOptions = {
    X: [
      { label: 'X PPLG 1', value: 'X PPLG 1' },
      { label: 'X PPLG 2', value: 'X PPLG 2' },
      { label: 'X RPL 1', value: 'X RPL 1' },
      { label: 'X RPL 2', value: 'X RPL 2' }
    ],
    XI: [
      { label: 'XI PPLG 1', value: 'XI PPLG 1' },
      { label: 'XI PPLG 2', value: 'XI PPLG 2' },
      { label: 'XI RPL 1', value: 'XI RPL 1' },
      { label: 'XI RPL 2', value: 'XI RPL 2' }
    ],
    XII: [
      { label: 'XII PPLG 1', value: 'XII PPLG 1' },
      { label: 'XII PPLG 2', value: 'XII PPLG 2' },
      { label: 'XII RPL 1', value: 'XII RPL 1' },
      { label: 'XII RPL 2', value: 'XII RPL 2' }
    ]
  };

  const kategoriOptions = ['Umum', 'Kejuruan'];
  const tingkatKelasOptions = [
    { label: 'Kelas X', value: 'X' },
    { label: 'Kelas XI', value: 'XI' },
    { label: 'Kelas XII', value: 'XII' }
  ];

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    setModalOpen(false);
    // Reset form
    setFormData({
      nama: '',
      kategori: '',
      deskripsi: '',
      imageLink: '',
      tingkatKelas: 'X',
      kelasTerpilih: []
    });
  };

  const handleTingkatKelasChange = (value: 'X' | 'XI' | 'XII') => {
    setFormData({
      ...formData,
      tingkatKelas: value,
      kelasTerpilih: [] // Reset pilihan kelas saat tingkat berubah
    });
    setTingkatKelasOpen(false);
  };

  const handleKategoriChange = (value: string) => {
    setFormData({
      ...formData,
      kategori: value
    });
    setKategoriOpen(false);
  };
    
  return (
    <>
      <div className={`w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${poppins.className}`}>
        {/* Add Course Card */}
        <button
          onClick={() => setModalOpen(true)}
          className={`${rubik.className} group relative h-full rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/50">
            <Plus className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Tambah Kursus
          </span>
          <span className={`${poppins.className} text-sm text-blue-600/70 dark:text-blue-400/70`}>
            Klik untuk membuat course baru
          </span>
        </button>
        
        <MapelCard
          namaMapel="Matematika"
          kategori="umum"
          kelas={["X PPLG 1", "X PPLG 2"]}
        />
        <MapelCard
          namaMapel="Matematika"
          kategori="umum"
          kelas={["X PPLG 1", "X PPLG 2"]}
        />
        <MapelCard
          namaMapel="Matematika"
          kategori="umum"
          kelas={["X PPLG 1", "X PPLG 2"]}
        />
      </div>

      {/* Add Course Dialog */}
      <FramerModal open={modalOpen} setOpen={setModalOpen}>
        <ModalContent>
          <div className={`mb-6 ${poppins.className}`}>
            <h2 className={`${rubik.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2`}>
              Tambah Course Baru
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lengkapi form di bawah untuk menambahkan course baru
            </p>
          </div>

          <div className={`space-y-5 ${poppins.className}`}>
            {/* Nama */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nama Course
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                placeholder="Contoh: Matematika"
                required
              />
            </div>

            {/* Kategori - Custom Dropdown */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <DropdownMenu open={kategoriOpen} onOpenChange={setKategoriOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500">
                    <span className={formData.kategori ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
                      {formData.kategori || "Pilih kategori..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${kategoriOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1"
                >
                  {kategoriOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleKategoriChange(option)}
                      className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {option}
                      </span>
                      {formData.kategori === option && (
                        <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Deskripsi */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full min-h-24 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-y"
                placeholder="Deskripsi singkat tentang course"
                required
              />
            </div>

            {/* Image Link */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image Link
              </label>
              <input
                type="url"
                value={formData.imageLink}
                onChange={(e) => setFormData({...formData, imageLink: e.target.value})}
                className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Tingkat Kelas Dropdown - Custom */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tingkat Kelas
              </label>
              <DropdownMenu open={tingkatKelasOpen} onOpenChange={setTingkatKelasOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500">
                    <span className="text-gray-900 dark:text-gray-100">
                      {tingkatKelasOptions.find(opt => opt.value === formData.tingkatKelas)?.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${tingkatKelasOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1"
                >
                  {tingkatKelasOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTingkatKelasChange(option.value as 'X' | 'XI' | 'XII')}
                      className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {option.label}
                      </span>
                      {formData.tingkatKelas === option.value && (
                        <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Multi Selector Kelas */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pilih Kelas
              </label>
              <MultiSelect
                options={kelasOptions[formData.tingkatKelas]}
                onValueChange={(selected) => setFormData({...formData, kelasTerpilih: selected})}
                defaultValue={formData.kelasTerpilih}
                placeholder="Pilih kelas..."
                maxCount={2}
                showall={false}
                className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                className={`${rubik.className} w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50`}
              >
                Simpan Course
              </button>
            </div>
          </div>
        </ModalContent>
      </FramerModal>
    </>
  )
}