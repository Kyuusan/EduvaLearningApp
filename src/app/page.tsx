"use client";

import { useState } from "react";
import { Poppins, Rubik } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageLoader } from "@/components/user/landingPage/pageLoader";
import { RetroGrid } from "@/components/user/landingPage/retroGrid";
import { NavbarUser } from "@/components/navbar/navbarUser";
import { ShineButton } from "@/components/user/landingPage/buttonShine";
import CountUp from "@/components/user/counter";
import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow,
} from '@/components/user/landingPage/marque';
import Mapel from "@/components/user/landingPage/mapel";
import { cardsData, FeatureCards } from "@/components/user/landingPage/feature";
import Footer from "@/components/user/landingPage/footer";
import EduvaSection from "@/components/user/landingPage/testimonial";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export default function Kyuusan() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <PageLoader
          companyName="EDUVA"
          rubikClassName={rubik.className}
          poppinsClassName={poppins.className}
          onLoadingComplete={() => setIsLoading(false)}
        />
      )}

      {/* hero section */}
      <section
        id="beranda"
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-blue-300 via-white to-whiteBg"
      >
        {/* background grid */}
        <div className="absolute inset-0 top-0 h-full w-full overflow-hidden">
          <RetroGrid cellSize={70} opacity={1} lightLineColor="#bbbbbb" />
        </div>

        {/* navbar - sticky */}
        <div className="lg:px-30 fixed top-2 z-50 w-full px-3 py-6 md:top-4 md:px-20 lg:top-0 lg:py-6">
          <NavbarUser />
        </div>

        {/* content container */}
        <div className="relative z-10 mt-32 w-full px-3 md:mt-20 md:px-20 lg:mt-32">
          <div
            className={`flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center gap-4 py-8 md:py-12 3xl:gap-8 ${rubik.className}`}
          >
            <motion.div
              className="flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-xl bg-white shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25)] md:h-[100px] md:w-[100px] md:rounded-lg"
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, -5, 0],
                transition: {
                  rotate: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                  scale: { duration: 0.2 },
                  boxShadow: { duration: 0.3 },
                },
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative h-[40px] w-[40px] md:h-[60px] md:w-[60px]"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >

              </motion.div>
            </motion.div>

            <h1 className="px-4 text-center text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl 2xl:text-7xl">
              Portal Belajar   <br />
              <span className="text-blue-900">SMK Nanuna Jaya Depok</span>
            </h1>

            <p className={`max-w-[700px] px-4 text-center text-base md:text-xl 2xl:text-2xl ${poppins.className}`}>
                Platform kegiatan belajar dan mengajar di era digital
            </p>

            {/* CTA Button desktop */}
            <div className="hidden md:flex md:gap-6 lg:scale-100 2xl:scale-125 3xl:gap-8">
              <Link href="/masuk">
                <ShineButton
                  label="Masuk"
                  size="md"
                  bgColor="linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

       <section id="tentang" className="w-full h-auto py-12 md:py-16 bg-whiteBg">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 lg:gap-12 lg:px-20 3xl:px-32 md:px-10 px-6 max-w-[1920px] mx-auto">
        
        {/* Image Section */}
        <div className="w-full flex justify-center items-center">
          <div className="relative w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px]">
            <Image
              src="/images/landingPage/tasVektor.png"
              alt="Eduva Learning Solutions"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
          
          {/* Heading */}
          <h1 className={`font-semibold text-3xl lg:text-4xl 2xl:text-5xl text-center lg:text-left leading-tight ${rubik.className}`}>
            <span className="text-blue-500">Eduva</span> Solusi Kemudahan Belajar
          </h1>

          {/* Description */}
          <p className={`text-base lg:text-lg 2xl:text-xl text-center lg:text-left text-gray-700 leading-relaxed ${poppins.className}`}>
              Eduva adalah sebuah platform media pembelajaran digital SMK Nanuna Jaya yang di tujukan untuk mengajarkan generasi penerus bangsa 
              untuk mengikuti dan adaptasi terhadap perkembangan zaman, Eduva juga membuat kegiatan belajar lebih efektif di bandingkan dengan cara belajar
              sebelumnya sehingga memudahkan siswa agar tidak diwajibkan membawa buku dari rumah
          </p>

          {/* Separator Line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent my-4"></div>

          {/* Statistics Section with Separators */}
          <div className={`w-full  ${poppins.className}`}>
            <div className="flex flex-col md:flex-row w-full items-center justify-center md:justify-between gap-6 md:gap-8">
              
              {/* Stat 1 */}
              <div className="flex flex-col items-center text-center space-y-2 flex-1">
                <div className="flex items-baseline gap-1">
                  <CountUp
                    from={0}
                    to={399}
                    separator=","
                    direction="up"
                    duration={3}
                    className="text-4xl 2xl:text-5xl font-bold text-gray-900"
                  />
                  <span className="text-4xl 2xl:text-5xl font-bold text-blue-500">+</span>
                </div>
                <span className="text-sm lg:text-base font-semibold text-blue-800 uppercase tracking-wide">
                  Siswa Aktif
                </span>
              </div>

              <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-blue-300 to-transparent"></div>

              {/* Horizontal Separator - Visible on mobile only */}
              <div className="md:hidden w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center text-center space-y-2 flex-1">
                <div className="flex items-baseline gap-1">
                  <CountUp
                    from={0}
                    to={30}
                    separator=","
                    direction="up"
                    duration={3}
                    className="text-4xl 2xl:text-5xl font-bold text-gray-900"
                  />
                  <span className="text-4xl 2xl:text-5xl font-bold text-blue-500">+</span>
                </div>
                <span className="text-sm lg:text-base font-semibold text-blue-800 uppercase tracking-wide">
                  Guru Mengajar
                </span>
              </div>

              {/* Vertical Separator - Hidden on mobile */}
              <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-blue-300 to-transparent"></div>

              {/* Horizontal Separator - Visible on mobile only */}
              <div className="md:hidden w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center text-center space-y-2 flex-1">
                <div className="flex items-baseline gap-1">
                  <CountUp
                    from={0}
                    to={99}
                    separator=","
                    direction="up"
                    duration={3}
                    className="text-4xl 2xl:text-5xl font-bold text-gray-900"
                  />
                  <span className="text-4xl lg:text-4xl font-bold text-blue-500">%</span>
                </div>
                <span className="text-sm lg:text-base font-semibold text-blue-800 uppercase tracking-wide">
                  Efektif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className=" w-full h-auto  space-y-16 py-20 2xl:py-40 bg-whiteBg ">

            <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 lg:px-20 3xl:px-32 md:px-10 px-6 ">
        
            <div className="col-span-1 w-full space-y-4 ">
                <h1 className={`font-semibold text-3xl lg:text-4xl 2xl:text-5xl leading-tight text-center lg:text-left  ${rubik.className}`}><span className="text-blue-500">Eduva</span> hadir untuk Era Digital</h1>
                <p className="text-base lg:text-lg 2xl:text-xl text-center lg:text-left">Digitalisasi kegiatan mengajar dan belajar dalam lingkup sekolah, menuju generasi maju </p>

             
            </div>

            <div className="col-span-2 w-full flex gap-8 ">
                <div className="relative w-full h-[160px] 2xl:h-[200px]  rounded-4xl rounded-tl-[60px]">
                    <Image
                    src={"/images/landingPage/digitalLearn.jpg"}
                    fill
                    alt="gambarBelajar"
                    className="object-cover object-top rounded-2xl rounded-tl-[60px]"
                    />
                </div>
                <div className="relative w-full h-[160px] 2xl:h-[200px]  rounded-4xl rounded-br-[60px] ">
                    <Image
                    src={"/images/landingPage/learning.jpg"}
                    fill
                    alt="gambarBelajar"
                    className="object-cover object-center rounded-2xl rounded-br-[60px]"
                    />
                  
                </div>
            </div>
          </div>

          <div className=" w-full  flex justify-center  gap-6 bg-whiteBg  ">
            <FeatureCards cards={cardsData}/>
      </div>
    </section>

    <section className="w-full h-auto py-12">
                <div className="w-full space-y-6">
              {/* <h1 className={`font-medium text-2xl lg:text-3xl 2xl:text-4xl leading-tight text-center   ${rubik.className}`}>Berbagai Macam Pelajaran</h1> */}
  {/* Baris pertama */}
  <ThreeDScrollTriggerContainer>
    <ThreeDScrollTriggerRow baseVelocity={5} direction={1}>
      <Mapel nama="Matematika" warna="bg-red-100 text-red-700" />
<Mapel nama="Bahasa Indonesia" warna="bg-orange-100 text-orange-700" />
<Mapel nama="Bahasa Inggris" warna="bg-blue-100 text-blue-700" />
<Mapel nama="Ilmu Pengetahuan Alam (IPA)" warna="bg-green-100 text-green-700" />
<Mapel nama="Ilmu Pengetahuan Sosial (IPS)" warna="bg-yellow-100 text-yellow-700" />
<Mapel nama="Pendidikan Agama Islam" warna="bg-emerald-100 text-emerald-700" />
<Mapel nama="Pendidikan Kewarganegaraan (PPKn)" warna="bg-purple-100 text-purple-700" />
<Mapel nama="Sejarah" warna="bg-rose-100 text-rose-700" />
<Mapel nama="Seni Budaya" warna="bg-pink-100 text-pink-700" />
<Mapel nama="Pendidikan Jasmani & Kesehatan" warna="bg-teal-100 text-teal-700" />

    </ThreeDScrollTriggerRow>
  </ThreeDScrollTriggerContainer>

  {/* Baris kedua */}
  <ThreeDScrollTriggerContainer>
    <ThreeDScrollTriggerRow baseVelocity={5} direction={-1} resetIntervalMs={5000}>
      <Mapel nama="Informatika" warna="bg-cyan-100 text-cyan-700" />
<Mapel nama="Prakarya" warna="bg-lime-100 text-lime-700" />
<Mapel nama="Ekonomi" warna="bg-amber-100 text-amber-700" />
<Mapel nama="Geografi" warna="bg-sky-100 text-sky-700" />
<Mapel nama="Sosiologi" warna="bg-indigo-100 text-indigo-700" />
<Mapel nama="Fisika" warna="bg-blue-100 text-blue-700" />
<Mapel nama="Kimia" warna="bg-green-100 text-green-700" />
<Mapel nama="Biologi" warna="bg-emerald-100 text-emerald-700" />
<Mapel nama="Bahasa Jepang" warna="bg-rose-100 text-rose-700" />
<Mapel nama="Bimbingan Konseling (BK)" warna="bg-gray-100 text-gray-700" />

    </ThreeDScrollTriggerRow>
  </ThreeDScrollTriggerContainer>
</div>
    </section>
    <EduvaSection/>
    <Footer/>
    </>
  );
}
