"use client";
import React, { useState } from 'react';
import { Search, ChevronDown, Check, X, Trash2, Clock, UserCheck } from 'lucide-react';

interface User {
  userId: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  email: string;
  access: 'Yes' | 'No';
  registeredAt: string;
}

const dummyUsers: User[] = [
  {
    userId: 'USR001',
    nisn: '0051234567',
    nama: 'Ahmad Fadilah',
    kelas: 'XII RPL 5',
    jurusan: 'PPLG',
    email: 'ahmad.fadilah@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 08:30'
  },
  {
    userId: 'USR002',
    nisn: '0051234568',
    nama: 'Siti Nurhaliza',
    kelas: 'XII PSPT 1',
    jurusan: 'PPLG',
    email: 'siti.nurhaliza@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 09:15'
  },
  {
    userId: 'USR003',
    nisn: '0051234569',
    nama: 'Budi Santoso',
    kelas: 'XI TJKT 5',
    jurusan: 'PPLG',
    email: 'budi.santoso@smk.sch.id',
    access: 'Yes',
    registeredAt: '2025-11-14 14:20'
  },
  {
    userId: 'USR004',
    nisn: '0051234570',
    nama: 'Dewi Lestari',
    kelas: 'XI ANIMASI 1',
    jurusan: 'TJKT',
    email: 'dewi.lestari@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 10:45'
  },
  {
    userId: 'USR005',
    nisn: '0051234571',
    nama: 'Rizky Pratama',
    kelas: 'X RPL 5',
    jurusan: 'PPLG',
    email: 'rizky.pratama@smk.sch.id',
    access: 'Yes',
    registeredAt: '2025-11-14 16:30'
  },
  {
    userId: 'USR006',
    nisn: '0051234572',
    nama: 'Fitri Handayani',
    kelas: 'X PSPT 2',
    jurusan: 'TJKT',
    email: 'fitri.handayani@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 11:20'
  },
  {
    userId: 'USR007',
    nisn: '0051234573',
    nama: 'Andi Wijaya',
    kelas: 'XII',
    jurusan: 'DKV',
    email: 'andi.wijaya@smk.sch.id',
    access: 'Yes',
    registeredAt: '2025-11-13 13:45'
  },
  {
    userId: 'USR008',
    nisn: '0051234574',
    nama: 'Maya Kusuma',
    kelas: 'XI',
    jurusan: 'DKV',
    email: 'maya.kusuma@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 12:10'
  },
  {
    userId: 'USR009',
    nisn: '0051234575',
    nama: 'Doni Setiawan',
    kelas: 'X',
    jurusan: 'PPLG',
    email: 'doni.setiawan@smk.sch.id',
    access: 'No',
    registeredAt: '2025-11-15 13:30'
  },
  {
    userId: 'USR010',
    nisn: '0051234576',
    nama: 'Rina Melati',
    kelas: 'XII',
    jurusan: 'TJKT',
    email: 'rina.melati@smk.sch.id',
    access: 'Yes',
    registeredAt: '2025-11-14 15:00'
  }
];

export default function UserApprovalTable() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccess, setFilterAccess] = useState<'All' | 'Pending' | 'Approved'>('All');

  const handleApprove = (userId: string) => {
    setUsers(users.map(user => 
      user.userId === userId ? { ...user, access: 'Yes' } : user
    ));
  };

  const handleReject = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus permintaan akses ini?')) {
      setUsers(users.filter(user => user.userId !== userId));
    }
  };

  const handleRevoke = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin mencabut akses user ini?')) {
      setUsers(users.map(user => 
        user.userId === userId ? { ...user, access: 'No' } : user
      ));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nisn.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterAccess === 'Pending') matchesFilter = user.access === 'No';
    if (filterAccess === 'Approved') matchesFilter = user.access === 'Yes';
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = users.filter(u => u.access === 'No').length;
  const approvedCount = users.filter(u => u.access === 'Yes').length;

  return (
    <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-rubik">
            User Access Approval
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-poppins">
            Kelola permintaan akses pengguna baru
          </p>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-poppins">Total</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-rubik">
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
                <p className="text-xs text-gray-600 dark:text-gray-400 font-poppins">Pending</p>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 font-rubik">
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
                <p className="text-xs text-gray-600 dark:text-gray-400 font-poppins">Approved</p>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 font-rubik">
                  {approvedCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Compact */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value as 'All' | 'Pending' | 'Approved')}
              className="appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Table - Compact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    User ID
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    NISN
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Nama
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Kelas
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Jurusan
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Email
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Waktu
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase font-rubik">
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
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white font-poppins">
                      {user.userId}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 font-poppins">
                      {user.nisn}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white font-poppins">
                      {user.nama}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 font-poppins">
                      {user.kelas}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-poppins">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        {user.jurusan}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 font-poppins">
                      {user.email}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 font-poppins">
                      {user.registeredAt}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-poppins">
                      {user.access === 'No' ? (
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
                        {user.access === 'No' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(user.userId)}
                              className="px-2 py-1 rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 transition-colors flex items-center gap-1 font-poppins text-xs font-medium"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(user.userId)}
                              className="p-1 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleRevoke(user.userId)}
                              className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1 font-poppins text-xs font-medium"
                            >
                              <X className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                            <button 
                              onClick={() => handleReject(user.userId)}
                              className="p-1 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 font-poppins">
                Tidak ada data yang ditemukan
              </p>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="mt-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-poppins">
            Menampilkan <span className="font-semibold">{filteredUsers.length}</span> dari <span className="font-semibold">{users.length}</span> pengguna
          </p>
        </div>
      </div>
    </div>
  );
}