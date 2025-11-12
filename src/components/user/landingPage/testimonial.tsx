import { useState } from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { BookOpen, Users, Award, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const poppinsClass = "font-sans";
const rubikClass = "font-serif";

// Testimonial Data
const testimonials = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "Siswa Kelas XI",
    type: "student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andi",
    testimonial: "Eduva membuat belajar jadi lebih menyenangkan! Materinya mudah dipahami dan bisa diakses kapan saja. Nilai saya meningkat drastis sejak menggunakan platform ini.",
    rating: 5
  },
  {
    id: 2,
    name: "Bu Siti Rahmawati",
    role: "Guru Matematika",
    type: "teacher",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    testimonial: "Platform yang sangat membantu untuk monitoring progress siswa. Fitur-fiturnya lengkap dan user-friendly, membuat proses mengajar menjadi lebih efisien.",
    rating: 5
  },
  {
    id: 3,
    name: "Rina Safitri",
    role: "Siswa Kelas XII",
    type: "student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rina",
    testimonial: "Dengan Eduva, saya bisa belajar mandiri dan mengulang materi yang belum paham. Soal-soal latihannya juga sangat membantu untuk persiapan ujian.",
    rating: 5
  },
  {
    id: 4,
    name: "Pak Budi Santoso",
    role: "Guru Bahasa Indonesia",
    type: "teacher",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
    testimonial: "Eduva menghadirkan solusi digital yang tepat untuk pendidikan modern. Saya bisa memberikan tugas dan feedback dengan lebih cepat dan terorganisir.",
    rating: 5
  }
];

// Stats for CTA Section
const stats = [
  {
    icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10 2xl:w-12 2xl:h-12" />,
    value: "500+",
    label: "Materi Pembelajaran",
    color: "from-blue-500 to-blue-700"
  },
  {
    icon: <Users className="w-8 h-8 md:w-10 md:h-10 2xl:w-12 2xl:h-12" />,
    value: "15+",
    label: "Mata Pelajaran",
    color: "from-cyan-500 to-cyan-700"
  },
  {
    icon: <Award className="w-8 h-8 md:w-10 md:h-10 2xl:w-12 2xl:h-12" />,
    value: "98%",
    label: "Tingkat Kepuasan",
    color: "from-indigo-500 to-indigo-700"
  },
  {
    icon: <TrendingUp className="w-8 h-8 md:w-10 md:h-10 2xl:w-12 2xl:h-12" />,
    value: "45%",
    label: "Peningkatan Nilai",
    color: "from-blue-600 to-blue-800"
  }
];

export default function EduvaAdditionalSections() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="w-full">
      {/* Testimonial Section */}
      <section id="testimoni" className="w-full h-auto py-16 md:py-20 2xl:py-32 bg-gradient-to-br from-whiteBg via-blue-50 to-blue-100">
        <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-20 3xl:px-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12 md:mb-16 2xl:mb-20"
          >
            <h2 className={`${rubikClass} font-semibold text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl text-gray-900`}>
              Apa Kata <span className="text-blue-800">Mereka?</span>
            </h2>
            <p className={`${poppinsClass} text-base md:text-lg 2xl:text-xl text-gray-600 max-w-2xl mx-auto`}>
              Dengarkan pengalaman siswa dan guru yang telah merasakan manfaat Eduva
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 2xl:p-10 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full -mr-12 -mt-12 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-full -ml-10 -mb-10 opacity-50"></div>

              {/* Quote Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-blue-800 mb-4"
              >
                <FaQuoteLeft className="w-6 h-6 md:w-8 md:h-8 2xl:w-10 2xl:h-10 opacity-30" />
              </motion.div>

              {/* Testimonial Content */}
              <div className="relative z-10">
                <p className={`${poppinsClass} text-sm md:text-base 2xl:text-lg text-gray-700 leading-relaxed mb-6`}>
                  {testimonials[currentTestimonial].testimonial}``
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 2xl:w-16 2xl:h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center"
                  >
                    {testimonials[currentTestimonial].type === "student" ? (
                      <FaUserGraduate className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-blue-800" />
                    ) : (
                      <FaChalkboardTeacher className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-blue-800" />
                    )}
                  </motion.div>
                  <div>
                    <h4 className={`${rubikClass} font-semibold text-base md:text-lg 2xl:text-xl text-gray-900`}>
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className={`${poppinsClass} text-xs md:text-sm 2xl:text-base text-blue-800`}>
                      {testimonials[currentTestimonial].role}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mt-3">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="text-yellow-400 text-base md:text-lg"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="bg-blue-800 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-blue-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="bg-blue-800 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-blue-900 transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? "bg-blue-800 w-6" : "bg-blue-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple Version */}
      <section className="w-full h-auto py-16 md:py-20 2xl:py-24 bg-whiteBg relative overflow-hidden">
        {/* Mesh Background Pattern */}
        <div className="absolute inset-0 opacity-[0.15]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mesh-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#1e40af" />
                <line x1="20" y1="20" x2="40" y2="20" stroke="#1e40af" strokeWidth="0.5" />
                <line x1="20" y1="20" x2="20" y2="40" stroke="#1e40af" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mesh-pattern)" />
          </svg>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30"></div>

        <div className="max-w-[1920px] mx-auto px-6 md:px-10 lg:px-20 3xl:px-32 relative z-10">
          {/* CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 md:space-y-8 max-w-3xl mx-auto"
          >
            <h2 className={`${rubikClass} font-semibold text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl text-gray-900 leading-tight`}>
              Mulai Perjalanan <span className="text-blue-800">Belajar Digitalmu</span>
            </h2>
            <p className={`${poppinsClass} text-base md:text-lg 2xl:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed`}>
             Eduva mendukung kemajuan teknologi dan menuju generasi yang cerdas
            </p>

            {/* Simple CTA Button */}
            <Link href={"/auth/masuk"}>
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-800 text-white px-8 md:px-12 2xl:px-14 py-3 md:py-4 2xl:py-4 rounded-full font-semibold text-base md:text-lg 2xl:text-xl shadow-xl hover:bg-blue-900 hover:shadow-2xl transition-all"
                >
                Mulai Sekarang
              </motion.button>
            </div>
                  </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}