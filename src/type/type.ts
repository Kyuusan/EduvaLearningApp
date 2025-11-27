// User Types
export interface User {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: 'siswa' | 'guru' | 'admin';
  createdAt: Date;
}

// Siswa Types
export interface Siswa {
  id: number;
  userId: number;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: 'RPL' | 'TJKT' | 'PSPT' | 'ANIM';
  email: string;
  password: string;
  accses: 'yes' | 'no';
  createdAt: Date;
}

// Guru Types
export interface Guru {
  guruId: number;
  userId: number;
  nama: string;
  email: string;
  password: string;
}

// Admin Types
export interface Admin {
  id: number;
  userId: number;
  nama: string;
  email: string;
  password: string;
}