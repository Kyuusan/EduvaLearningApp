"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Trash2, Clock, UserCheck, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Poppins, Rubik } from 'next/font/google';
import { FramerModal, ModalContent } from '@/components/user/dialog';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik"
});

interface User {
  userId: number;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  email: string;
  access: boolean;
  registeredAt: string;
}

interface ConfirmDialog {
  isOpen: boolean;
  type: 'revoke' | 'delete' | null;
  userId: number | null;
  userName: string;
}

export default function UserApprovalTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccess, setFilterAccess] = useState<'All' | 'Pending' | 'Approved'>('All');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    type: null,
    userId: null,
    userName: '',
  });

  // Fetch users dari API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/manageUser');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (type: 'revoke' | 'delete', userId: number, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      userId,
      userName,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      userId: null,
      userName: '',
    });
  };

  const handleApprove = async (userId: number) => {
    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/manageUser', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(users.map(user => 
        user.userId === userId ? { ...user, access: true } : user
      ));
      
      toast.success('Akses berhasil disetujui');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Gagal menyetujui akses');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async () => {
    if (!confirmDialog.userId) return;

    try {
      setActionLoading(confirmDialog.userId);
      const response = await fetch('/api/admin/manageUser', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: confirmDialog.userId,
          action: 'revoke',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke user');
      }

      // Update local state
      setUsers(users.map(user => 
        user.userId === confirmDialog.userId ? { ...user, access: false } : user
      ));
      
      toast.success('Akses berhasil dicabut');
      closeConfirmDialog();
    } catch (error) {
      console.error('Error revoking user:', error);
      toast.error('Gagal mencabut akses');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.userId) return;

    try {
      setActionLoading(confirmDialog.userId);
      const response = await fetch('/api/admin/manageUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: confirmDialog.userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove from local state
      setUsers(users.filter(user => user.userId !== confirmDialog.userId));
      
      toast.success('Pengguna berhasil dihapus');
      closeConfirmDialog();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nisn.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterAccess === 'Pending') matchesFilter = !user.access;
    if (filterAccess === 'Approved') matchesFilter = user.access;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = users.filter(u => !u.access).length;
  const approvedCount = users.filter(u => u.access).length;

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <p className={`text-sm text-gray-600 dark:text-gray-400 ${poppins.className}`}>
            Memuat data pengguna...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${rubik.className}`}>
            User Access Approval
          </h1>
          <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 ${poppins.className}`}>
            Kelola permintaan akses pengguna baru
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>Total</p>
                <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${rubik.className}`}>
                  {users.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className={`text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>Pending</p>
                <h3 className={`text-xl font-bold text-amber-600 dark:text-amber-400 ${rubik.className}`}>
                  {pendingCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>Approved</p>
                <h3 className={`text-xl font-bold text-green-600 dark:text-green-400 ${rubik.className}`}>
                  {approvedCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${poppins.className} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div className="relative">
            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value as 'All' | 'Pending' | 'Approved')}
              className={`appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${poppins.className} focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer`}
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    User ID
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    NISN
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Nama
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Kelas
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Jurusan
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Email
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Waktu
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Status
                  </th>
                  <th className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${rubik.className}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white ${poppins.className}`}>
                      #{user.userId}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>
                      {user.nisn}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white ${poppins.className}`}>
                      {user.nama}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>
                      {user.kelas}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs ${poppins.className}`}>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        {user.jurusan}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>
                      {user.email}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>
                      {new Date(user.registeredAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className={`px-3 py-2.5 whitespace-nowrap ${poppins.className}`}>
                      {!user.access ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {!user.access ? (
                          <>
                            <button 
                              onClick={() => handleApprove(user.userId)}
                              disabled={actionLoading === user.userId}
                              className={`px-2 py-1 rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 transition-colors flex items-center gap-1 ${poppins.className} text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {actionLoading === user.userId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </button>
                            <button 
                              onClick={() => openConfirmDialog('delete', user.userId, user.nama)}
                              disabled={actionLoading === user.userId}
                              className="p-1 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => openConfirmDialog('revoke', user.userId, user.nama)}
                              disabled={actionLoading === user.userId}
                              className={`px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1 ${poppins.className} text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {actionLoading === user.userId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              Revoke
                            </button>
                            <button 
                              onClick={() => openConfirmDialog('delete', user.userId, user.nama)}
                              disabled={actionLoading === user.userId}
                              className="p-1 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-sm text-gray-500 dark:text-gray-400 ${poppins.className}`}>
                Tidak ada data yang ditemukan
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3">
          <p className={`text-xs text-gray-600 dark:text-gray-400 ${poppins.className}`}>
            Menampilkan <span className="font-semibold">{filteredUsers.length}</span> dari <span className="font-semibold">{users.length}</span> pengguna
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <FramerModal open={confirmDialog.isOpen} setOpen={closeConfirmDialog}>
        <ModalContent>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                confirmDialog.type === 'delete' 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  confirmDialog.type === 'delete' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${rubik.className}`}>
                  {confirmDialog.type === 'delete' ? 'Hapus Pengguna' : 'Cabut Akses'}
                </h3>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${poppins.className}`}>
                  Konfirmasi tindakan Anda
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${poppins.className}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {confirmDialog.type === 'delete' ? (
                  <>
                    Apakah Anda yakin ingin menghapus pengguna{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {confirmDialog.userName}
                    </span>
                    ?
                    <br />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Tindakan ini tidak dapat dibatalkan.
                    </span>
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin mencabut akses pengguna{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {confirmDialog.userName}
                    </span>
                    ?
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={closeConfirmDialog}
                disabled={actionLoading !== null}
                className={`px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${poppins.className} text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Batal
              </button>
              <button
                onClick={confirmDialog.type === 'delete' ? handleDelete : handleRevoke}
                disabled={actionLoading !== null}
                className={`px-4 py-2 rounded-lg transition-colors ${poppins.className} text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  confirmDialog.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {actionLoading !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmDialog.type === 'delete' ? 'Ya, Hapus' : 'Ya, Cabut Akses'}
              </button>
            </div>
          </div>
        </ModalContent>
      </FramerModal>
    </div>
  );
}