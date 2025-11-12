'use client';
import { CircleChevronLeft, Leaf, Eye, EyeOff } from "lucide-react";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        toast.error('Login gagal: ' + authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      const accessToken = authData.session.access_token;
      const refreshToken = authData.session.refresh_token;

      localStorage.setItem('supabase_access_token', accessToken);
      localStorage.setItem('supabase_refresh_token', refreshToken);
      localStorage.setItem('user_id', userId);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, active_token')
        .eq('id', userId)
        .single();

      if (profileError) {
        toast.error('Profil tidak ditemukan. Hubungi admin.');
        setLoading(false);
        return;
      }

      const userRole = profileData.role;
      localStorage.setItem('user_role', userRole);
      localStorage.setItem('user_email', email);

      setLoading(false);

      if (userRole === 'admin') {
        toast.success('Login berhasil! Selamat datang, Admin!');
        router.push('/admin/default');
      } else {
        toast.success('Login berhasil! Selamat datang!');
        router.push('/user/home');
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Terjadi kesalahan tidak terduga.');
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
                  onSubmit={handleLogin}
                >
                  <div className="space-y-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm placeholder-gray-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.6 }}
                      className="relative"
                    >
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#60a5fa" }}
                        transition={{ duration: 0.2 }}
                        className="w-full rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm placeholder-gray-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none pr-12"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kata Sandi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-800 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </motion.div>

                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.7 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <motion.label 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center cursor-pointer"
                      >
                        <input type="checkbox" className="mr-2 text-blue-600 focus:ring-blue-500" />
                        <span className="text-gray-600">Ingat saya</span>
                      </motion.label>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                      >
                        <Link href="/auth/lupa-password" className="font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200">
                          Lupa kata sandi?
                        </Link>
                      </motion.div>
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
                  Harita
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}