'use client';
import { CircleChevronLeft, Leaf, Eye, EyeOff } from "lucide-react";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { signIn, useSession } from "next-auth/react"
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

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
    if (!formData.email || !formData.password) {
      setError("email dan password harus di isi")
      toast.error("Email dan password harus diisi");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login...");
      
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log(" SignIn result:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (!result?.ok) {
        throw new Error(result?.error || "Login gagal");
      }

      toast.success('Login berhasil!');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentSession = await fetch('/api/auth/session').then(res => res.json());
      
      console.log(" Current session:", currentSession);
      console.log(" User role:", currentSession?.user?.role);

      const userRole = currentSession?.user?.role;

      if (userRole === 'siswa') {
        console.log(" Redirecting to /user (siswa)");
        router.push('/user');
      } else if (userRole === 'admin') {
        console.log(" Redirecting to /admin (admin)");
        router.push('/admin');
      } else if (userRole === 'guru') {
        console.log(" Redirecting to /admin (guru)");
        router.push('/admin');
      } else {
        console.log(" Unknown role, defaulting to /user");
        router.push('/user');
      }

      router.refresh();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat login';
      console.error('Login error:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
      `}</style>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex h-screen justify-center bg-gray-100"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative m-0 flex max-w-screen-xl flex-1 justify-center bg-white shadow sm:m-6 sm:rounded-lg overflow-hidden"
        >
          <div className="flex-1 hidden lg:flex lg:w-2/5 xl:w-5/12 relative overflow-hidden">
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden flex-1 overflow-hidden lg:flex"
            >
              <motion.div
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Link href="/">
                  <div className="absolute left-6 top-6 z-50 cursor-pointer"> 
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CircleChevronLeft
                        width={30}
                        height={30}
                        className="stroke-white hover:stroke-blue-400 transition-all duration-300 ease-out z-50"
                      />
                    </motion.div>
                  </div>
                </Link>

                <Image
                  src="https://milenianews.com/wp-content/uploads/2023/01/smk-taruna-bhakti-768x544.jpg"
                  alt="Background"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute inset-0 bg-black"
              />

              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative z-10 flex w-full flex-col items-center justify-center p-8 text-white"
              >
                <div className="max-w-md text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1,
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
                        <Leaf className="h-10 w-10 text-white" strokeWidth={1.5} />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="mb-4 text-2xl font-bold xl:text-3xl"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    Selamat Datang Kembali di{' '}
                    <motion.span 
                  
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-blue-400"
                    >
                      Eduva
                    </motion.span>
                  </motion.h2>

                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="mb-6 text-base leading-relaxed text-gray-200"
                  >
                    Masuk ke akun Anda dan lanjutkan perjalanan menjadi cendekiawan
                  </motion.p>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="border-t border-white border-opacity-20 pt-6"
                  >
                    <p className="mb-4 text-sm text-gray-200">
                      Belum memiliki akun?
                    </p>
                    <Link href="/auth/daftar">
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
                        Daftar Sekarang
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT SIDE FORM */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col justify-center p-4 sm:p-8 lg:w-3/5 xl:w-7/12"
          >
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mb-4 text-xl font-bold xl:text-2xl"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                Masuk
              </motion.h1>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="w-full max-w-sm"
              >
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

                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  onSubmit={handleSubmit}
                >
                   <div className="space-y-3">
                    {/* Email */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
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

                    {/* Password */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                      className="relative"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium placeholder-gray-500 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 pr-12"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="flex flex-col gap-1.5"
                  >
                    <motion.button
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 8px 25px rgba(30, 64, 175, 0.3)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      type="submit"
                      disabled={loading}
                      className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-800 py-3 font-semibold tracking-wide text-white transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:bg-blue-900"
                      style={{ fontFamily: 'Rubik, sans-serif' }}
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
                          <span className="text-sm">Memuat...</span>
                        </motion.div>
                      ) : (
                        <span className="ml-2 text-sm">Masuk</span>
                      )}
                    </motion.button>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.9 }}
                      className="text-sm mt-2"
                    >
                      <span>Belum punya akun? </span>
                      <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                        <Link href="/auth/daftar" className="font-bold text-blue-800 hover:text-blue-500 transition-colors duration-150 ease-out">
                          daftar
                        </Link>
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </motion.form>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2 }}
                  className="mt-4 text-center text-xs text-gray-600"
                >
                  Dengan masuk, Anda menyetujui{' '}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href="#"
                    className="border-b border-dotted border-blue-600 text-blue-800 hover:text-blue-900 transition-colors duration-200"
                  >
                    Syarat & Ketentuan
                  </motion.a>{' '}
                  dan{' '}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href="#"
                    className="border-b border-dotted border-blue-600 text-blue-800 hover:text-blue-900 transition-colors duration-200"
                  >
                    Kebijakan Privasi
                  </motion.a>{' '}
                 Eduva
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}