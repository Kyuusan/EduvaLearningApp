"use client";
import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronDown,
  FileText,
  Calendar,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { 
  SketchAccordion, 
  SketchAccordionItem, 
  SketchAccordionTrigger, 
  SketchAccordionContent 
} from "@/components/user/accordition";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent 
} from '@/components/user/dropdown';
import { getSubmissionsByCourse, getSubmissionFileUrl } from '../../../../../../lib/submitionTask.action';
import { formatDeadline, formatFileSize, getStatusBadgeColor } from '../../../../../../lib/task';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Poppins, Rubik } from 'next/font/google';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  weight: ['500', '600', '700', '800'],
});

interface Submission {
  submissionId: number | null;
  siswaId: number;
  siswaNama: string;
  nisn: string;
  kelasNama: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  status: 'submitted' | 'late' | 'not_submitted';
  submittedAt: string | null;
}

interface TaskSubmissions {
  tugasId: number;
  tugasJudul: string;
  deadline: string;
  submissions: Submission[];
  totalStudents: number;
  submittedCount: number;
  lateCount: number;
  notSubmittedCount: number;
}

export default function StudentsSubmissionsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const unwrappedParams = use(params);
  const courseId = parseInt(unwrappedParams.id);
  const router = useRouter();

  const [data, setData] = useState<TaskSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'late' | 'not_submitted'>('all');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [kelasDropdownOpen, setKelasDropdownOpen] = useState(false);

  useEffect(() => {
    if (!courseId || isNaN(courseId)) return;
    loadSubmissions();
  }, [courseId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const result = await getSubmissionsByCourse(courseId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Gagal memuat data');
      }
    } catch (error) {
      console.error('Load submissions error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (submissionId: number) => {
    try {
      const result = await getSubmissionFileUrl(submissionId);
      if (result.success && result.data) {
        window.open(result.data.fileUrl, '_blank');
        toast.success(`Mengunduh file ${result.data.siswaNama}`);
      } else {
        toast.error('Tidak ada file untuk didownload');
      }
    } catch (error) {
      toast.error('Gagal mengunduh file');
    }
  };

  const getFilteredSubmissions = (submissions: Submission[]) => {
    return submissions.filter(sub => {
      if (filterStatus !== 'all' && sub.status !== filterStatus) {
        return false;
      }
      if (filterKelas !== 'all' && sub.kelasNama !== filterKelas) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          sub.siswaNama.toLowerCase().includes(query) ||
          sub.nisn.includes(query)
        );
      }
      return true;
    });
  };

  const allKelas = [...new Set(
    data.flatMap(task => task.submissions.map(sub => sub.kelasNama))
  )].sort();

  const statusOptions = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Sudah Submit', value: 'submitted' },
    { label: 'Terlambat', value: 'late' },
    { label: 'Belum Submit', value: 'not_submitted' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${poppins.className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali ke Materi</span>
          </button>

          <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-3 ${rubik.className}`}>
            Pengumpulan Tugas Siswa
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Monitor status pengumpulan tugas dari semua siswa
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${rubik.className}`}>
              Filter & Pencarian
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Filter Status */}
            <DropdownMenu open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="w-full h-11 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500"
                >
                  <span className={filterStatus === 'all' ? "text-gray-500" : "text-gray-900 dark:text-gray-100"}>
                    {statusOptions.find(opt => opt.value === filterStatus)?.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1"
              >
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value as any);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {option.label}
                    </span>
                    {filterStatus === option.value && (
                      <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Kelas */}
            <DropdownMenu open={kelasDropdownOpen} onOpenChange={setKelasDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="w-full h-11 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500"
                >
                  <span className={filterKelas === 'all' ? "text-gray-500" : "text-gray-900 dark:text-gray-100"}>
                    {filterKelas === 'all' ? 'Semua Kelas' : filterKelas}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${kelasDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1 max-h-64 overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setFilterKelas('all');
                    setKelasDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                >
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Semua Kelas
                  </span>
                  {filterKelas === 'all' && (
                    <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                  )}
                </button>
                {allKelas.map((kelas) => (
                  <button
                    key={kelas}
                    onClick={() => {
                      setFilterKelas(kelas);
                      setKelasDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {kelas}
                    </span>
                    {filterKelas === kelas && (
                      <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tasks Accordion */}
        <SketchAccordion type="single" collapsible className="space-y-4">
          {data.map((task) => {
            const filteredSubs = getFilteredSubmissions(task.submissions);
            
            return (
              <SketchAccordionItem key={task.tugasId} value={`task-${task.tugasId}`}>
                <SketchAccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4 py-4">
                    <div className="flex-1 text-left">
                      <h3 className={`lg:text-xl text-lg font-bold text-gray-900 dark:text-white mb-3 ${rubik.className}`}>
                        {task.tugasJudul}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            Deadline: {formatDeadline(task.deadline)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            {task.submittedCount}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-semibold">
                            <Clock className="w-4 h-4" />
                            {task.lateCount}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                            <XCircle className="w-4 h-4" />
                            {task.notSubmittedCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className={`text-3xl font-bold text-blue-600 dark:text-blue-400 ${rubik.className}`}>
                        {task.submittedCount + task.lateCount}/{task.totalStudents}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Terkumpul
                      </p>
                    </div>
                  </div>
                </SketchAccordionTrigger>

                <SketchAccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            No
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            NISN
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            Nama Siswa
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            Kelas
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            Status
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            Waktu Submit
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            File
                          </th>
                          <th className={`px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${rubik.className}`}>
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSubs.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center">
                              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Tidak ada data yang sesuai filter
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredSubs.map((sub, index) => {
                            const statusColor = getStatusBadgeColor(sub.status as any);
                            
                            return (
                              <tr key={sub.siswaId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                                  {sub.nisn}
                                </td>
                                <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                                  {sub.siswaNama}
                                </td>
                                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                                  {sub.kelasNama}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text}`}>
                                    {sub.status === 'submitted' && 'Sudah Submit'}
                                    {sub.status === 'late' && 'Terlambat'}
                                    {sub.status === 'not_submitted' && 'Belum Submit'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                                  {sub.submittedAt 
                                    ? new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : '-'
                                  }
                                </td>
                                <td className="px-4 py-3.5 text-sm">
                                  {sub.fileName ? (
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-gray-900 dark:text-white truncate max-w-[150px] font-medium">
                                          {sub.fileName}
                                        </p>
                                        {sub.fileSize && (
                                          <p className="text-xs text-gray-500">
                                            {formatFileSize(sub.fileSize)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  {sub.submissionId && sub.fileUrl ? (
                                    <button
                                      onClick={() => handleDownload(sub.submissionId!)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Download
                                    </button>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </SketchAccordionContent>
              </SketchAccordionItem>
            );
          })}
        </SketchAccordion>

        {/* Empty State */}
        {data.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className={`text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 ${rubik.className}`}>
              Belum Ada Tugas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada tugas di course ini. Buat tugas terlebih dahulu di halaman materi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}