'use client';
import React, { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, CircleChevronLeft, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/user/dropdown';

type Jurusan = 'RPL' | 'PSPT' | 'TJKT' | 'ANIM' | '';

interface FormData {
  nisn: string;
  nama: string;
  kelas: string;
  email: string;
}

interface JurusanOption {
  value: 'RPL' | 'PSPT' | 'TJKT' | 'ANIM';
  label: string;
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJurusan, setSelectedJurusan] = useState<Jurusan>("");
  
  const [formData, setFormData] = useState<FormData>({
    nisn: '',
    nama: '',
    kelas: '',
    email: ''
  });

  const jurusanOptions: JurusanOption[] = [
    { value: "RPL", label: "RPL" },
    { value: "PSPT", label: "PSPT" },
    { value: "TJKT", label: "TJKT" },
    { value: "ANIM", label: "ANIM" }
  ];

  const handleJurusanSelect = (jurusan: 'RPL' | 'PSPT' | 'TJKT' | 'ANIM') => {
    setSelectedJurusan(jurusan);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validasi
    if (!formData.nisn || !formData.nama || !formData.kelas || !selectedJurusan || !formData.email) {
      setError("Semua field harus diisi");
      toast.error("Semua field harus diisi");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jurusan: selectedJurusan
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      toast.success(data.message);
      
      setTimeout(() => {
        router.push('/auth/masuk');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      console.error('Registration error:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>  
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex h-screen justify-center bg-gray-100 text-gray-900"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <Toaster position="top-center" reverseOrder={false} />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative m-0 flex max-w-screen-xl flex-1 justify-center bg-white shadow sm:m-6 sm:rounded-lg overflow-hidden"
        >
          {/* Back button (mobile & tablet only) */}
          <div className="absolute left-4 top-4 z-50 lg:hidden">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-2 rounded-full"
              >
                <CircleChevronLeft
                  size={28}
                  className="text-blue-800 transition-colors duration-300 ease-in-out hover:text-blue-500"
                />
              </motion.div>
            </Link>
          </div>

          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center p-4 sm:p-8 lg:w-3/5 xl:w-7/12"
          >
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col items-center"
            >
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-4 text-xl font-bold xl:text-2xl"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                Daftar
              </motion.h1>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="w-full max-w-sm"
              >
                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4 text-center text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200"
                    >
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-3">
                    {/* NISN */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                        type="number"
                        name="nisn"
                        value={formData.nisn}
                        onChange={handleInputChange}
                        placeholder="NISN"
                        maxLength={9}
                      />
                    </motion.div>

                    {/* Nama Lengkap */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        placeholder="Nama Lengkap"
                      />
                    </motion.div>

                    {/* Kelas */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.6 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                        type="text"
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        placeholder="Kelas"
                      />
                    </motion.div>

                    {/* Jurusan Dropdown */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.65 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            type="button"
                            whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                            transition={{ duration: 0.2 }}
                            className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium text-left focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 flex justify-between items-center"
                          >
                            <span className={selectedJurusan ? "text-gray-900" : "text-gray-500"}>
                              {selectedJurusan || "Jurusan"}
                            </span>
                            <ChevronDown size={16} className="text-gray-500" />
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          {jurusanOptions.map((option) => (
                            <motion.div
                              key={option.value}
                              whileHover={{ backgroundColor: "#f3f4f6" }}
                              className="px-4 py-2.5 text-sm cursor-pointer transition-colors rounded-md"
                              onClick={() => handleJurusanSelect(option.value)}
                            >
                              {option.label}
                            </motion.div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.7 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                      />
                    </motion.div>

                    {/* Password Info */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                      className="relative"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 pr-12"
                        type='text'
                        value={"Kata sandi bawaan : SMK1234"}
                        readOnly
                      />
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.9 }}
                    className="flex flex-col gap-1.5"
                  >
                    {/* Register Button */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 8px 25px rgba(30, 64, 175, 0.3)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      type="submit"
                      className="focus:shadow-outline mt-5 flex w-full items-center justify-center rounded-lg bg-blue-800 py-3 font-semibold tracking-wide text-white transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-blue-900"
                      style={{ fontFamily: 'Rubik, sans-serif' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                          />
                          <span className="text-sm">Mendaftar...</span>
                        </motion.div>
                      ) : (
                        <span className="ml-2 text-sm">Daftar</span>
                      )}
                    </motion.button>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 2 }}
                      className="pt-2 text-sm"
                    >
                      <span>Sudah punya akun? </span>
                      <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                        <Link href={'/auth/masuk'}>
                          <span className="font-bold text-blue-800 transition-colors duration-150 ease-out hover:text-blue-500">
                            masuk
                          </span>
                        </Link>
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </motion.form>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2.1 }}
                  className="mt-4 text-center text-xs text-gray-600"
                >
                  Akun anda akan di proses admin untuk persetujuan pembuatan akun {''}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href="#"
                    className="border-b border-dotted border-blue-600 text-blue-800 transition-colors duration-200 hover:text-blue-900"
                  >
                  hal ini bagian dari Syarat & Ketentuan
                  </motion.a>{' '}
                  dan{' '}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href="#"
                    className="border-b border-dotted border-blue-600 text-blue-800 transition-colors duration-200 hover:text-blue-900"
                  >
                    Kebijakan Privasi
                  </motion.a>{' '}
                  Eduva
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right side content */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative hidden flex-1 overflow-hidden lg:flex lg:w-2/5 xl:w-5/12"
          >
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Link href={'/'}>
                <div className='absolute left-6 top-6 z-50 cursor-pointer'> 
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CircleChevronLeft
                      width={30}
                      height={30}
                      className='stroke-white hover:stroke-blue-400 transition-all duration-300 ease-out z-50'
                    />
                  </motion.div>
                </div>
              </Link>
              <Image
                src="https://milenianews.com/wp-content/uploads/2023/01/smk-taruna-bhakti-768x544.jpg"
                alt="Team collaboration background"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute inset-0 bg-black"
            />

            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="relative z-10 flex w-full flex-col items-center justify-center p-8 text-white"
            >
              <div className="max-w-md text-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1.2,
                    type: "spring",
                    stiffness: 200 
                  }}
                  className="mb-6"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-10 backdrop-blur-sm">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <Users className="h-10 w-10 text-white" strokeWidth={1.5} />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="mb-4 text-2xl font-bold xl:text-3xl"
                  style={{ fontFamily: 'Rubik, sans-serif' }}
                >
                  Selamat Datang di{' '}
                  <span className='text-blue-400'>Eduva</span>
                </motion.h2>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="mb-6 text-base leading-relaxed text-gray-200 xl:text-lg"
                >
                  Bergabunglah dan jadikan Eduva sebagai solusi digital
                  Pembelajaran Anda Setiap Hari
                </motion.p>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  className="border-t border-white border-opacity-20 pt-6"
                >
                  <p className="mb-4 text-sm text-gray-200">
                    Sudah memiliki akun?
                  </p>
                  <Link href="/auth/masuk">
                    <motion.button 
                      whileHover={{ 
                        scale: 1.05, 
                        y: -2,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-lg bg-white px-8 py-2 font-semibold text-blue-800 shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      style={{ fontFamily: 'Rubik, sans-serif' }}
                    >
                      Masuk
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}