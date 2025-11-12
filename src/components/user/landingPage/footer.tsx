import React from "react";
import {
  FaFacebookSquare,
  FaGithubSquare,
  FaInstagram,
  FaTwitterSquare,
} from "react-icons/fa";

// Komponen Reusable untuk ikon sosial media
const SocialIcon = ({ icon: Icon }) => (
  <Icon className="text-white hover:text-blue-300 transition-colors duration-200" size={28} />
);

// Komponen Footer
const Footer = () => {
  const items = [
    // Ikon sosial media
    { type: "icon", icon: FaFacebookSquare },
    { type: "icon", icon: FaInstagram },
    { type: "icon", icon: FaTwitterSquare },
    { type: "icon", icon: FaGithubSquare },

    // Bagian footer
    {
      type: "section",
      title: "Portal Belajar",
      items: ["Beranda", "Kelas Digital", "Fitur Interaktif", "Materi Pembelajaran", "Evaluasi & Nilai"],
    },
    {
      type: "section",
      title: "Bantuan",
      items: ["Panduan Siswa", "Panduan Guru", "FAQ", "Hubungi Kami"],
    },
    {
      type: "section",
      title: "Kebijakan",
      items: ["Privasi", "Syarat & Ketentuan", "Hak Cipta"],
    },
  ];

  return (
    <footer className="bg-blue-900 mx-auto py-16 px-8 md:px-16 grid lg:grid-cols-3 gap-8 text-gray-300 font-nunito">
      {/* Bagian kiri (brand + deskripsi + sosial media) */}
      <div>
        <h1 className="w-full font-inter text-4xl xl:text-5xl font-bold text-white tracking-tight">
          EDUVA
        </h1>
        <p className="py-4 text-white text-sm leading-relaxed">
          Eduva adalah portal belajar modern yang membantu siswa dan guru
          terhubung dalam proses pembelajaran digital yang interaktif,
          efisien, dan menyenangkan. Belajar jadi lebih mudah dan bermakna.
        </p>
        <div className="flex gap-6 my-6">
          {items
            .filter((item) => item.type === "icon")
            .map((item, index) => (
              <SocialIcon key={index} icon={item.icon} />
            ))}
        </div>
      </div>

      {/* Bagian kanan (navigasi footer) */}
      <div className="lg:col-span-2 flex md:justify-evenly justify-between mt-6">
        {items
          .filter((item) => item.type === "section")
          .map((section, index) => (
            <div key={index}>
              <h6 className="font-semibold text-gray-100 text-lg mb-3">
                {section.title}
              </h6>
              <ul>
                {section.items.map((subItem, subIndex) => (
                  <li
                    key={subIndex}
                    className="py-1.5 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors"
                  >
                    {subItem}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </footer>
  );
};

export default Footer;
