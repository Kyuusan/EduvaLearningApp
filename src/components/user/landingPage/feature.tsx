import React from "react";
import { GraduationCap, Clock, Laptop, Globe } from "lucide-react";
import { Poppins, Rubik } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

// ---- Type untuk FeatureCard ----
interface FeatureCardProps {
  icon: LucideIcon | React.ElementType; // tipe untuk ikon komponen (bisa dari lucide-react atau custom)
  title: string;
  description: string;
  color: string; 
  iconColor: string; // Tailwind text color class, misal "text-white"
  rubikFont?: string; // opsional, misal "font-rubik"
  poppinsFont?: string; // opsional, misal "font-poppins"
}



export const cardsData = [
  {
    icon: GraduationCap,
    title: "Akses Materi Kapan Saja",
    description: "Belajar di mana pun dan kapan pun tanpa batas waktu.",
    color: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    icon: Clock,
    title: "Efisiensi Waktu",
    description: "Belajar lebih cepat di bandingkan dengan buku offline",
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    icon: Laptop,
    title: "Interaktif dan Modern",
    description: "Belajar lebih menarik dan interaktif lewat media digital.",
    color: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    icon: Globe,
    title: "Akses Informasi Luas",
    description: "Mendukung pembelajaran global dengan sumber online terkini.",
    color: "bg-purple-100",
    iconColor: "text-purple-500",
  },
];


const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
  iconColor,
}) => {
  return (
    <div className=" w-full sm:w-[48%] lg:w-[23%] h-[200px] md:h-[220px] group relative bg-white rounded-3xl border-2 border-gray-300 shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden p-6">
      {/* Background hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div
          className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon
            className={`w-6 h-6 ${iconColor} transition-transform duration-300 group-hover:scale-110`}
          />
        </div>

        {/* Title */}
        <h3
          className={`${rubik.className} text-lg 2xl:text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`${poppins.className}  text-sm 2xl:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300`}
        >
          {description}
        </p>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
    </div>
  );
};

// ---- Type untuk FeatureCards ----
interface FeatureCardsProps {
  cards: Omit<FeatureCardProps, "rubikFont" | "poppinsFont">[]; // ambil semua prop FeatureCard kecuali font
  rubikFont?: string;
  poppinsFont?: string;
}

const FeatureCards: React.FC<FeatureCardsProps> = ({
  cards,
  rubikFont,
  poppinsFont,
}) => {
  return (
    <div className="w-full flex flex-wrap gap-6 px-6 md:px-10 lg:px-20">
      {cards.map((card, index) => (
        <FeatureCard
          key={index}
          {...card}
          rubikFont={rubikFont}
          poppinsFont={poppinsFont}
        />
      ))}
    </div>
  );
};

export { FeatureCard, FeatureCards };
