"use client"
import MapelCard from "@/components/user/courseCard"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import type { Course } from "../../../../lib/course.action";
import { ModalContent, FramerModal } from '@/components/user/dialog';
import { Plus, ChevronDown, Check, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { MultiSelect } from "@/components/user/multiSelector";
import { Poppins, Rubik } from 'next/font/google';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent 
} from '@/components/user/dropdown';
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

interface Kelas {
  id: number;
  nama: string;
  tingkat: 'X' | 'XI' | 'XII';
  jurusan: 'RPL' | 'TJKT' | 'PSPT' | 'ANIM';
  jumlahSiswa?: number;
}

interface FormDataType {
  nama: string;
  kategori: 'Umum' | 'Kejuruan' | '';
  deskripsi: string;
  imageUrl: string;
  tingkat: 'X' | 'XI' | 'XII';
  kelasIds: number[];
}

export default function Course() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [tingkatKelasOpen, setTingkatKelasOpen] = useState(false);
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk edit mode
  const [editMode, setEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // State untuk kelas options
  const [kelasOptions, setKelasOptions] = useState<Record<'X' | 'XI' | 'XII', Kelas[]>>({
    X: [],
    XI: [],
    XII: []
  });
  const [loadingKelas, setLoadingKelas] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>({
    nama: '',
    kategori: '',
    deskripsi: '',
    imageUrl: '',
    tingkat: 'X',
    kelasIds: []
  });

  const kategoriOptions: Array<'Umum' | 'Kejuruan'> = ['Umum', 'Kejuruan'];
  const tingkatKelasOptions = [
    { label: 'Kelas X', value: 'X' as const },
    { label: 'Kelas XI', value: 'XI' as const },
    { label: 'Kelas XII', value: 'XII' as const }
  ];

    const handleCourseClick = (courseId: number) => {
    router.push(`/admin/course/${courseId}`);
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [session]);

  // Fetch kelas when tingkat changes or modal opens
  useEffect(() => {
    if (modalOpen) {
      fetchKelas(formData.tingkat);
    }
  }, [modalOpen, formData.tingkat]);

  const fetchCourses = async () => {
  try {
    console.log('🔄 Fetching courses...');
    setLoading(true);
    setError(null);
    
    const response = await fetch('/api/course/guru');
    const data = await response.json();

    console.log('📡 Raw API response:', data);
    console.log('📊 Courses array:', data.data);
    console.log('📝 Number of courses:', data.data?.length || 0);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch courses');
    }

    setCourses(data.data || []);
    console.log('✅ Courses state updated:', data.data?.length || 0, 'courses');
    
  } catch (err: any) {
    console.error('❌ Error fetching courses:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const fetchKelas = async (tingkat: 'X' | 'XI' | 'XII') => {
    try {
      setLoadingKelas(true);
      
      const response = await fetch(`/api/course/guru?action=kelas&tingkat=${tingkat}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch kelas');
      }

      setKelasOptions(prev => ({
        ...prev,
        [tingkat]: data.data || []
      }));
    } catch (err: any) {
      console.error('Error fetching kelas:', err);
      setError('Gagal memuat data kelas');
    } finally {
      setLoadingKelas(false);
    }
  };

const handleSubmit = async () => {
  console.group('🔍 Course Submit Debug');
  console.log('1. Session:', session);
  console.log('2. Form Data:', formData);
  console.log('3. Edit Mode:', editMode);
  console.log('4. Editing Course ID:', editingCourseId);
  console.groupEnd();

  // Validasi input
  if (!formData.nama?.trim()) {
    setError('Nama course harus diisi');
    return;
  }
  
  if (!formData.kategori) {
    setError('Kategori harus dipilih');
    return;
  }
  
  if (!formData.deskripsi?.trim()) {
    setError('Deskripsi harus diisi');
    return;
  }
  
  if (!formData.tingkat) {
    setError('Tingkat kelas harus dipilih');
    return;
  }
  
  if (!formData.kelasIds || formData.kelasIds.length === 0) {
    setError('Minimal pilih 1 kelas');
    return;
  }

  // Validasi session
  if (!session?.user?.roleId) {
    setError('Session tidak valid. Silakan login ulang.');
    return;
  }

  try {
    setSubmitting(true);
    setError(null);

    const payload = editMode ? {
      id: editingCourseId, 
      nama: formData.nama.trim(),
      deskripsi: formData.deskripsi.trim(),
      kategori: formData.kategori,
      tingkat: formData.tingkat,
      kelasIds: formData.kelasIds, 
      imageUrl: formData.imageUrl?.trim()
    } : {
      nama: formData.nama.trim(),
      deskripsi: formData.deskripsi.trim(),
      kategori: formData.kategori,
      tingkat: formData.tingkat,
      kelasIds: formData.kelasIds,
      imageUrl: formData.imageUrl?.trim()
    };

    console.log('📦 Payload:', payload);

    const url = editMode ? `/api/course/guru?id=${editingCourseId}` : '/api/course/guru';
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('✅ Response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${editMode ? 'update' : 'create'} course`);
    }

    // ✅ PERBAIKAN: Tunggu fetchCourses selesai sebelum close modal
    console.log('🔄 Refreshing courses...');
    await fetchCourses();
    console.log('✅ Courses refreshed');

    // ✅ Tambahkan sedikit delay untuk memastikan state terupdate
    await new Promise(resolve => setTimeout(resolve, 300));

    // Baru close modal dan reset form
    setModalOpen(false);
    resetForm();
    
    console.log('✅ Course', editMode ? 'updated' : 'created', 'successfully!');
    
  } catch (err: any) {
    console.error(`❌ Error ${editMode ? 'updating' : 'creating'} course:`, err);
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
};


const handleEdit = async (course: Course) => {
  console.log('Editing course:', course);
  
  setEditMode(true);
  setEditingCourseId(course.id);
  
  // Extract kelasIds dari enrolledKelas
  const kelasIds = course.enrolledKelas?.map(k => k.kelasId) || [];
  
  console.log('Extracted kelasIds:', kelasIds);
  
  // Populate form with existing data
  const newFormData = {
    nama: course.nama || '',
    kategori: (course.kategori as 'Umum' | 'Kejuruan') || '',
    deskripsi: course.deskripsi || '',
    imageUrl: course.imageUrl || '',
    tingkat: (course.tingkat as 'X' | 'XI' | 'XII') || 'X',
    kelasIds: kelasIds
  };
  
  console.log('New form data:', newFormData);
  
  setFormData(newFormData);
  
  // Fetch kelas untuk tingkat yang dipilih jika belum ada
  if (kelasOptions[newFormData.tingkat].length === 0) {
    await fetchKelas(newFormData.tingkat);
  }
  
  setModalOpen(true);
};

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      
      const response = await fetch(`/api/course/guru?id=${courseToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }

      // Refresh courses list
      await fetchCourses();
      
      // Close modal
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      kategori: '',
      deskripsi: '',
      imageUrl: '',
      tingkat: 'X',
      kelasIds: []
    });
    setError(null);
    setEditMode(false);
    setEditingCourseId(null);
  };

  const handleTingkatKelasChange = (value: 'X' | 'XI' | 'XII') => {
    setFormData({
      ...formData,
      tingkat: value,
      kelasIds: []
    });
    setTingkatKelasOpen(false);
    
    if (kelasOptions[value].length === 0) {
      fetchKelas(value);
    }
  };

  const handleKategoriChange = (value: 'Umum' | 'Kejuruan') => {
    setFormData({
      ...formData,
      kategori: value
    });
    setKategoriOpen(false);
  };

  const formatKelasForMultiSelect = (kelasList: Kelas[]) => {
    return kelasList.map(kelas => ({
      label: `${kelas.nama} (${kelas.jumlahSiswa || 0} siswa)`,
      value: kelas.id.toString(),
      disable: false
    }));
  };

  const handleKelasChange = (selectedValues: string[]) => {
    const kelasIds = selectedValues.map(val => parseInt(val));
    setFormData({ ...formData, kelasIds });
  };
    
  return (
    <>
      <div className={`w-full ${poppins.className}`}>
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {/* Add Course Card */}
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className={`${rubik.className} group relative h-full rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6 min-h-[280px]`}
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
            
            {/* Course Cards */}
            {courses.map((course) => (
              <div key={course.id} className="relative group">
                <MapelCard
                  namaMapel={course.nama}
                  kategori={course.kategori.toLowerCase() as "umum" | "kejuruan"}
                  deskripsi={course.deskripsi}
                  kelas={course.enrolledKelas?.map(k => k.kelasNama) || []}
                  onDelete={() => handleDeleteClick(course)}
                  imageUrl={course.imageUrl}
                  courseId={course.id}
                  onClick={() => handleCourseClick(course.id)} 
                />
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-110 active:scale-95 transition-all duration-200 group/edit"
                    title="Edit Course"
                  >
                    <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/edit:text-blue-700 dark:group-hover/edit:text-blue-300" />
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(course)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl border-2 border-red-200 dark:border-red-700 hover:border-red-400 dark:hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-200 group/delete"
                    title="Hapus Course"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover/delete:text-red-700 dark:group-hover/delete:text-red-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className={`${rubik.className} text-xl font-bold text-gray-700 dark:text-gray-300 mb-2`}>
              Belum Ada Course
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Klik tombol "Tambah Kursus" untuk membuat course pertama Anda
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Course Dialog */}
      <FramerModal open={modalOpen} setOpen={(open) => {
        setModalOpen(open);
        if (!open) resetForm();
      }}>
        <ModalContent>
          <div className={`mb-6 ${poppins.className}`}>
            <h2 className={`${rubik.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2`}>
              {editMode ? 'Edit Course' : 'Tambah Course Baru'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editMode ? 'Update informasi course yang sudah ada' : 'Lengkapi form di bawah untuk menambahkan course baru'}
            </p>
          </div>

          {/* Error Alert in Modal */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-3 mb-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          <div className={`space-y-5 ${poppins.className}`}>
            {/* Nama */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nama Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                placeholder="Contoh: Matematika"
                required
                disabled={submitting}
              />
            </div>

            {/* Kategori - Custom Dropdown */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <DropdownMenu open={kategoriOpen} onOpenChange={setKategoriOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500"
                    disabled={submitting}
                  >
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
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full min-h-24 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-y"
                placeholder="Deskripsi singkat tentang course"
                required
                disabled={submitting}
              />
            </div>

            {/* Image Link */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image Link (Opsional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                placeholder="https://example.com/image.jpg"
                disabled={submitting}
              />
            </div>

            {/* Tingkat Kelas Dropdown - Custom */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tingkat Kelas <span className="text-red-500">*</span>
              </label>
              <DropdownMenu open={tingkatKelasOpen} onOpenChange={setTingkatKelasOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500"
                    disabled={submitting}
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {tingkatKelasOptions.find(opt => opt.value === formData.tingkat)?.label}
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
                      onClick={() => handleTingkatKelasChange(option.value)}
                      className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {option.label}
                      </span>
                      {formData.tingkat === option.value && (
                        <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Multi Selector Kelas - Dynamic */}
      {/* Multi Selector Kelas - Dynamic */}
<div className="group">
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
    Pilih Kelas <span className="text-red-500">*</span>
  </label>
  
  {loadingKelas ? (
    <div className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      <span className="ml-2 text-sm text-gray-500">Loading kelas...</span>
    </div>
  ) : kelasOptions[formData.tingkat].length === 0 ? (
    <div className="w-full h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <span className="text-sm text-gray-500">Tidak ada kelas tersedia untuk tingkat {formData.tingkat}</span>
    </div>
  ) : (
    <MultiSelect
      key={`${editMode}-${editingCourseId}-${formData.tingkat}`} // Force re-render on edit
      options={formatKelasForMultiSelect(kelasOptions[formData.tingkat])}
      onValueChange={handleKelasChange}
      defaultValue={formData.kelasIds.map(id => id.toString())}
      placeholder="Pilih kelas..."
      maxCount={2}
      showall={false}
      className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 focus:border-blue-500 transition-all duration-200"
      disabled={submitting}
    />
  )}
</div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`${rubik.className} w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {editMode ? 'Mengupdate...' : 'Menyimpan...'}
                  </>
                ) : (
                  <>
                    {editMode ? (
                      <>
                        <Pencil className="w-5 h-5" />
                        Update Course
                      </>
                    ) : (
                      'Simpan Course'
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalContent>
      </FramerModal>

      {/* Delete Confirmation Dialog */}
      <FramerModal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
        <ModalContent>
          <div className={`${poppins.className}`}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className={`${rubik.className} text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2`}>
                  Hapus Course
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Apakah Anda yakin ingin menghapus course ini?
              </p>
              {courseToDelete && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {courseToDelete.nama}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {courseToDelete.kategori} • {courseToDelete.tingkat}
                  </p>
                  {courseToDelete.enrolledKelas && courseToDelete.enrolledKelas.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Terdaftar di {courseToDelete.enrolledKelas.length} kelas:
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {courseToDelete.enrolledKelas.map(k => k.kelasNama).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCourseToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 h-11 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className={`${rubik.className} flex-1 h-11 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Hapus Course
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalContent>
      </FramerModal>
    </>
  )
}