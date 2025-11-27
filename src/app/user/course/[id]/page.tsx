"use client";
import React, { useState, useRef, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Upload, Download, Loader2, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { 
  SketchAccordion, 
  SketchAccordionItem, 
  SketchAccordionTrigger, 
  SketchAccordionContent 
} from "@/components/user/accordition";
import { ResponsiveModal, ResponsiveModalContent } from '@/components/user/responsiveModal';
import { 
  getCourseDetail, 
  getTasksSiswa, 
  submitTask, 
  updateSubmission,
  getTaskFileUrl 
} from '../../../../../lib/task.action';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  courseId: number;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  status: 'completed' | 'pending';
  submissionId?: number;
  submittedAt?: string;
  submissionStatus?: 'submitted' | 'late';
}

export default function SiswaCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Unwrap params Promise - SAMA SEPERTI ADMIN/GURU
  const unwrappedParams = use(params);
  const courseId = parseInt(unwrappedParams.id);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

    const [showPopover, setShowPopover] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
  
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

  useEffect(() => {
    // ✅ Validasi courseId - SAMA SEPERTI ADMIN/GURU
    if (!courseId || isNaN(courseId)) {
      console.error('❌ Invalid courseId:', courseId);
      return;
    }
    
    loadData();
  }, [courseId]);

  const loadData = async () => {
    console.group('🔍 SiswaCourseDetail - loadData');
    console.log('CourseId:', courseId);
    
    setLoading(true);
    
    try {
      console.log('🔄 Starting API calls...');
      
      const [detailRes, tasksRes] = await Promise.all([
        getCourseDetail(courseId),
        getTasksSiswa(courseId)
      ]);

      console.log('📦 Detail Response:', detailRes);
      console.log('📦 Tasks Response:', tasksRes);

      if (detailRes.success) {
        console.log('✅ Setting course detail:', detailRes.data);
        setCourseDetail(detailRes.data);
      } else {
        console.error('❌ Detail failed:', detailRes.error);
        toast.error(detailRes.error || 'Gagal memuat course');
      }

      if (tasksRes.success) {
        console.log('✅ Setting tasks:', tasksRes.data?.length || 0, 'tasks');
        setTasks(tasksRes.data || []);
      } else {
        console.error('❌ Tasks failed:', tasksRes.error);
        toast.error(tasksRes.error || 'Gagal memuat tugas');
      }
    } catch (error) {
      console.error('❌ loadData ERROR:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
      console.log('✅ loadData FINISHED');
      console.groupEnd();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

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
    if (files && files[0]) handleFile(files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
  };

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Uploading file to /api/upload...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Upload response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Upload failed:', error);
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('✅ Upload success:', data);

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

  const handleSubmitTask = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    if (!selectedTask) {
      toast.error('Tugas tidak ditemukan');
      return;
    }

    console.group('📤 Submit Task');
    console.log('Task ID:', selectedTask.id);
    console.log('File:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    console.log('Edit Mode:', editMode);
    console.log('Submission ID:', selectedTask.submissionId);

    setUploading(true);

    // ✅ Upload file
    const fileData = await uploadFile(selectedFile);
    
    if (!fileData) {
      setUploading(false);
      console.groupEnd();
      return;
    }

    console.log('💾 Submitting to database...');
    const result = editMode && selectedTask.submissionId
      ? await updateSubmission(selectedTask.submissionId, fileData)
      : await submitTask({
          tugasId: selectedTask.id,
          ...fileData
        });

    console.log('📦 Result:', result);
    console.groupEnd();

    setUploading(false);

    if (result.success) {
      const message = result.status === 'late' 
        ? (editMode ? 'Pengumpulan berhasil diupdate (Terlambat)' : 'Tugas berhasil dikumpulkan (Terlambat)')
        : (editMode ? 'Pengumpulan berhasil diupdate' : 'Tugas berhasil dikumpulkan');
      
      toast.success(message);
      
      handleRemoveFile();
      setDrawerOpen(false);
      setEditMode(false);
      setSelectedTask(null);
      loadData();
    } else {
      toast.error(result.error || 'Gagal mengumpulkan tugas');
    }
  };

  const openSubmitModal = (task: Task, isEdit: boolean = false) => {
    console.log('🔓 Opening submit modal:', {
      taskId: task.id,
      isEdit,
      hasSubmission: !!task.submissionId
    });
    setSelectedTask(task);
    setEditMode(isEdit);
    setDrawerOpen(true);
  };

  const handleDownloadMateri = async (taskId: number) => {
    console.log('⬇️ Downloading materi for task:', taskId);
    const result = await getTaskFileUrl(taskId);
    
    if (result.success && result.data) {
      console.log('✅ File URL:', result.data.fileUrl);
      window.open(result.data.fileUrl, '_blank');
    } else {
      console.error('❌ No file available');
      toast.error('Tidak ada materi untuk didownload');
    }
  };

  // ✅ Validasi courseId - SAMA SEPERTI ADMIN/GURU
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

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Semua Tugas ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Sudah Dikerjakan ({completedCount})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Belum Dikerjakan ({pendingCount})
              </button>
            </div>
          </div>

          {/* Guru Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Guru Mata Pelajaran</h2>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">{courseDetail?.namaGuru || 'Nama Guru'}</p>
            </div>
          </div>

          {/* Tasks Accordion */}
          <SketchAccordion type="single" collapsible className="space-y-3">
            {filteredTasks.map((task, index) => (
              <SketchAccordionItem key={task.id} value={`task-${task.id}`}>
                <SketchAccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4 py-4">
                    <span className="lg:text-xl text-lg text-left font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {task.judul}
                    </span>
                    {task.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        Belum
                      </span>
                    )}
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

                    {/* ✅ Status Late */}
                    {task.status === 'completed' && task.submissionStatus === 'late' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Pengumpulan Terlambat
                        </span>
                      </div>
                    )}

                    {/* ✅ Waktu Pengumpulan */}
                    {task.status === 'completed' && task.submittedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Dikumpulkan: {new Date(task.submittedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      {task.fileUrl && (
                        <button
                          onClick={() => handleDownloadMateri(task.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Buka Materi
                        </button>
                      )}
                      {task.status === 'pending' ? (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openSubmitModal(task)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          Kumpulkan Tugas
                        </motion.button>
                      ) : (
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed text-sm font-medium">
                            Tugas Telah Dikumpulkan
                          </button>
                          <button
                            onClick={() => openSubmitModal(task, true)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit Pengumpulan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </SketchAccordionContent>
              </SketchAccordionItem>
            ))}
          </SketchAccordion>

          {filteredTasks.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada tugas yang {activeTab === 'completed' ? 'sudah dikerjakan' : activeTab === 'pending' ? 'belum dikerjakan' : 'tersedia'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <ResponsiveModal open={drawerOpen} setOpen={setDrawerOpen}>
        <ResponsiveModalContent>
          <div className="flex flex-col space-y-1.5 text-center h-fit dark:bg-neutral-800 md:p-4 p-6">
            <div className="flex flex-col space-y-1.5">
              <h1 className="font-medium text-2xl">
                {editMode ? 'Edit Pengumpulan Tugas' : 'Kumpulkan Tugas Anda'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Upload file tugas Anda di sini (Max 5MB)
              </p>
            </div>

            <div data-vaul-no-drag className="py-4 space-y-4">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-3 rounded-full transition-colors ${
                      isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-neutral-100 dark:bg-neutral-800'
                    }`}
                  >
                    <Upload
                      className={`w-6 h-6 ${
                        isDragging ? 'text-blue-500' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {isDragging ? 'Drop File Disini' : 'Drag & Drop atau Klik'}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left"
                >
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                    <span className="font-medium">File:</span> {selectedFile.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </motion.div>
              )}

              <button
                onClick={handleSubmitTask}
                disabled={!selectedFile || uploading}
                className={`w-full rounded-lg p-3 font-medium transition-all ${
                  selectedFile && !uploading
                    ? 'bg-blue-500 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengupload...
                  </span>
                ) : (
                  'Kumpulkan Tugas'
                )}
              </button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
