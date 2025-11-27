// app/admin/course/[id]/page.tsx
"use client";
import React, { useState, useRef, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash, Edit, FileText, Upload, X, Download, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { 
  SketchAccordion, 
  SketchAccordionItem, 
  SketchAccordionTrigger, 
  SketchAccordionContent 
} from "@/components/user/accordition";
import { ResponsiveModal, ResponsiveModalContent } from '@/components/user/responsiveModal';
import { ModalContent, FramerModal } from '@/components/user/dialog';
import { 
  getCourseDetail, 
  getTasksGuru, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskFileUrl 
} from '../../../../../lib/task.action';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Task {
  id: number;
  courseId: number;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdBy: number;
  createdAt: string;
}

interface CourseHeaderCompactProps {
  courseDetail: {
    namaCourse: string;
    enrolledClasses: string[];
  } | null;
}

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Unwrap params Promise
  const unwrappedParams = use(params);
  
  const courseId = parseInt(unwrappedParams.id);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    deadline: '',
  });

  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    
    if (!courseId || isNaN(courseId)) {
      console.error('❌ Invalid courseId:', courseId);
      return;
    }
    
    loadData();
  }, [courseId]);

  const loadData = async () => {
    
    setLoading(true);
    
    try {
      console.log('🔄 Starting API calls...');
      
      const [detailRes, tasksRes] = await Promise.all([
        getCourseDetail(courseId),
        getTasksGuru(courseId)
      ]);

      console.log('detailRes:', detailRes);
      console.log('tasksRes:', tasksRes);

      if (detailRes.success) {
        console.log('✅ Setting course detail:', detailRes.data);
        setCourseDetail(detailRes.data);
      } else {
        console.log('❌ Course detail failed:', detailRes.error);
        toast.error(detailRes.error || 'Gagal memuat detail course');
      }

      if (tasksRes.success) {
        console.log('✅ Setting tasks:', tasksRes.data?.length || 0, 'tasks');
        setTasks(tasksRes.data || []);
      } else {
        console.log('❌ Tasks failed:', tasksRes.error);
      }
    } catch (error) {
      console.error('❌ loadData ERROR:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
      console.log('✅ loadData FINISHED');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return {
        fileUrl: data.fileUrl,
        fileName: file.name,
        fileSize: file.size
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Gagal mengupload file');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.judul.trim()) {
      toast.error('Nama tugas harus diisi');
      return;
    }

    if (!formData.deadline) {
      toast.error('Deadline harus diisi');
      return;
    }

    setUploading(true);

    let fileData = null;
    
    // ✅ Hanya upload file baru jika ada file yang dipilih
    if (selectedFile) {
      console.log('📤 Uploading new file:', selectedFile.name);
      fileData = await uploadFile(selectedFile);
      if (!fileData) {
        setUploading(false);
        return;
      }
      console.log('✅ File uploaded:', fileData.fileUrl);
    } else if (editMode && selectedTask?.fileUrl) {
      // ✅ Pertahankan file lama jika tidak ada file baru
      console.log('📎 Keeping existing file:', selectedTask.fileName);
      fileData = {
        fileUrl: selectedTask.fileUrl,
        fileName: selectedTask.fileName || '',
        fileSize: selectedTask.fileSize || 0
      };
    }

    const taskData = {
      courseId,
      judul: formData.judul,
      deskripsi: formData.deskripsi,
      deadline: formData.deadline,
      ...(fileData && {
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize
      })
    };

    console.log('💾 Submitting task data:', {
      ...taskData,
      hasFile: !!fileData,
      isEdit: editMode
    });

    const result = editMode && selectedTask
      ? await updateTask(selectedTask.id, taskData)
      : await createTask(taskData);

    setUploading(false);

    if (result.success) {
      console.log('✅ Task saved successfully');
      toast.success(editMode ? 'Tugas berhasil diupdate' : 'Tugas berhasil dibuat');
      setFormData({ judul: '', deskripsi: '', deadline: '' });
      setSelectedFile(null);
      setModalOpen(false);
      setEditMode(false);
      setSelectedTask(null);
      loadData();
    } else {
      console.error('❌ Failed to save task:', result.error);
      toast.error(result.error || 'Gagal menyimpan tugas');
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      judul: task.judul,
      deskripsi: task.deskripsi || '',
      deadline: task.deadline,
    });
    setEditMode(true);
    setModalOpen(true);
  };

  // ✅ Open delete confirmation modal
  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  // ✅ Handle delete with modal
  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setDeleting(true);
    const result = await deleteTask(taskToDelete.id);
    setDeleting(false);

    if (result.success) {
      toast.success('Tugas berhasil dihapus');
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      loadData();
    } else {
      toast.error(result.error || 'Gagal menghapus tugas');
    }
  };

  const handleDownload = async (taskId: number) => {
    const result = await getTaskFileUrl(taskId);
    if (result.success && result.data) {
      window.open(result.data.fileUrl, '_blank');
    } else {
      toast.error('Tidak ada file untuk didownload');
    }
  };

  //popover kelas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    }

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowPopover(false);
      }
    }

    if (showPopover) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showPopover]);

  const visibleClasses = courseDetail?.enrolledClasses?.slice(0, 3) || [];
  const hiddenClasses = courseDetail?.enrolledClasses?.slice(3) || [];
  const totalClasses = courseDetail?.enrolledClasses?.length || 0;


  const openAddModal = () => {
    setEditMode(false);
    setSelectedTask(null);
    setFormData({ judul: '', deskripsi: '', deadline: '' });
    setSelectedFile(null);
    setModalOpen(true);
  };

  // ✅ Validasi courseId
  if (isNaN(courseId) || courseId <= 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Course ID</h1>
          <p className="text-gray-600">Course ID must be a valid positive number</p>
          <p className="text-sm text-gray-500 mt-2">Received: {unwrappedParams.id}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
           <div className="mb-6">
      {/* Course Title */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
        {courseDetail?.namaCourse || 'Loading...'}
      </h1>

      {/* Classes Info */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Visible Classes */}
        {visibleClasses.map((kelas: string, index: number) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
          >
            {kelas}
          </motion.span>
        ))}

        {/* Show All Button */}
        {hiddenClasses.length > 0 && (
          <div className="relative inline-block">
            <button
              ref={buttonRef}
              onClick={() => setShowPopover(!showPopover)}
              className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              +{hiddenClasses.length}
              <ChevronDown 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showPopover ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Popover - Positioned Smartly */}
            <AnimatePresence>
              {showPopover && (
                <>
                  {/* Backdrop for mobile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
                    onClick={() => setShowPopover(false)}
                  />

                  {/* Popover Card */}
                  <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 z-50 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Semua Kelas ({totalClasses})
                      </h3>
                      <button
                        onClick={() => setShowPopover(false)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Content - Grid Layout */}
                    <div className="p-3 max-h-96 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 gap-1.5">
                        {courseDetail?.enrolledClasses?.map((kelas: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {kelas}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
                Materi
              </button>
              <button className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Peserta
              </button>
            </div>
          </div>

          {/* Guru Info & Add Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-blue-500">Tambah Tugas</h2>
            </div>
            <div className="p-4 flex justify-between items-center">
              <h1 className="text-base font-semibold dark:text-white">
              Guru Mata Pelajaran:  {" "}  <span className='text-blue-500'>{courseDetail?.namaGuru || 'Nama Guru'}</span>
              </h1>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="flex gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-300"
              >
                Tambah Tugas <Plus className="w-[18px] h-auto" strokeWidth={3} />
              </motion.button>
            </div>
          </div>

          {/* Tasks Accordion */}
          <SketchAccordion type="single" collapsible className="space-y-3">
            {tasks.map((task, index) => (
              <SketchAccordionItem key={task.id} value={`task-${task.id}`}>
                <SketchAccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4 py-4">
                    <span className="lg:text-xl text-lg text-left font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {task.judul}
                    </span>
                  </div>
                </SketchAccordionTrigger>
                <SketchAccordionContent>
                  <div className="space-y-4">
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      {task.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Batas Waktu: {new Date(task.deadline).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {task.fileUrl && (
                        <button
                          onClick={() => handleDownload(task.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Download Materi
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Edit Tugas
                      </button>
                      <button
                        onClick={() => openDeleteModal(task)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </SketchAccordionContent>
              </SketchAccordionItem>
            ))}
          </SketchAccordion>

          {tasks.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Belum ada tugas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form - Add/Edit Task */}
      <ResponsiveModal open={modalOpen} setOpen={setModalOpen}>
        <ResponsiveModalContent className="max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col p-6 md:p-8">
            <h1 className="font-semibold text-3xl mb-2 text-blue-500">
              {editMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {editMode ? 'Update informasi tugas' : 'Lengkapi form di bawah untuk menambahkan tugas baru'}
            </p>

            <div data-vaul-no-drag className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nama Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  placeholder="Contoh: Tugas Matematika Bab 5"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Deskripsi singkat tentang tugas..."
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Upload Materi
                </label>
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {isDragging ? 'Drop file di sini' : 'Drag & drop atau klik untuk browse'}
                    </p>
                    <p className="text-xs text-neutral-400">Maksimal 10MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveFile}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-4 rounded-lg bg-blue-500 hover:bg-blue-600 p-3.5 font-medium text-white transition-all disabled:opacity-50"
              >
                {uploading ? 'Menyimpan...' : editMode ? 'Update Tugas' : 'Buat Tugas'}
              </button>
            </div>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Delete Confirmation Modal */}
      <FramerModal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
        <ModalContent className="max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Hapus Tugas?
            </h2>
            
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus tugas{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{taskToDelete?.judul}"
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setTaskToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </ModalContent>
      </FramerModal>
    </>
  );
}