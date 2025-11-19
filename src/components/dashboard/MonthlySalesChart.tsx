'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rubik, Poppins } from "next/font/google";

const rubik = Rubik({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const VisiMisiCard = () => {
  const [activeTab, setActiveTab] = useState("visi");

  const tabVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
      <div className="flex items-center justify-between">
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`${rubik.className} text-xl font-semibold text-gray-800 dark:text-white/90`}
        >
          Visi & Misi SMK Nanuna Jaya
        </motion.h3>
      </div>

      {/* Tabs Button */}
      <div className="mt-4 flex gap-3 border-b border-gray-200 dark:border-gray-700 relative">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setActiveTab("visi")}
          className={`${poppins.className} pb-2 px-1 text-base font-medium transition-colors duration-200 relative ${
            activeTab === "visi"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-blue-500 dark:text-gray-400"
          }`}
        >
          Visi
          {activeTab === "visi" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
        
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setActiveTab("misi")}
          className={`${poppins.className} pb-2 px-1 text-base font-medium transition-colors duration-200 relative ${
            activeTab === "misi"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-blue-500 dark:text-gray-400"
          }`}
        >
          Misi
          {activeTab === "misi" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4 min-h-[120px]">
        <AnimatePresence mode="wait">
          {activeTab === "visi" && (
            <motion.div
              key="visi"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${poppins.className} text-gray-700 dark:text-gray-300 text-sm leading-relaxed`}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Menjadi sekolah kejuruan unggul yang menghasilkan lulusan
                berkarakter, berkompeten, dan siap bersaing di dunia kerja maupun
                wirausaha mandiri.
              </motion.p>
            </motion.div>
          )}
          
          {activeTab === "misi" && (
            <motion.div
              key="misi"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${poppins.className} text-gray-700 dark:text-gray-300 text-sm leading-relaxed`}
            >
              <ul className="list-disc pl-5 space-y-2">
                {[
                  "Meningkatkan kualitas pembelajaran berbasis teknologi.",
                  "Membangun karakter siswa yang disiplin, jujur, dan tangguh.",
                  "Menjalin kerja sama dengan industri dan dunia usaha.",
                  "Mendorong kreativitas dan inovasi dalam setiap bidang keahlian."
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    custom={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ 
                      x: 5, 
                      color: "#3B82F6",
                      transition: { duration: 0.2 }
                    }}
                    className="cursor-default"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VisiMisiCard;