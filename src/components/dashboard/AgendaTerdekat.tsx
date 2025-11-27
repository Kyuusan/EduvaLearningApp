"use client";

import { useEffect, useState } from "react";

interface Agenda {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
}

export default function AgendaTerdekat() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgendas() {
      try {
        const response = await fetch("/api/kalendar", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data agenda");
        }

        const data = await response.json();
        
        if (data.success && data.agendas) {
          // Filter agenda terdekat dari hari ini
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcomingAgendas = data.agendas
            .filter((agenda: Agenda) => {
              const startDate = new Date(agenda.tanggalMulai);
              return startDate >= today;
            })
            .slice(0, 5); // Ambil maksimal 5 agenda terdekat
          
          setAgendas(upcomingAgendas);
        }
      } catch (error) {
        console.error("Error fetching agendas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgendas();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="rounded-2xl h-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 h-full bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Agenda Terdekat
          </h3>
          <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
            SMK Nanuna Jaya Depok
          </p>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Memuat agenda...
            </div>
          ) : agendas.length === 0 ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Tidak ada agenda terdekat
            </div>
          ) : (
            <div className="space-y-3">
              {agendas.map((agenda) => {
                const daysUntil = getDaysUntil(agenda.tanggalMulai);
                const daysText = 
                  daysUntil === 0 
                    ? "Hari ini" 
                    : daysUntil === 1 
                    ? "Besok" 
                    : `${daysUntil} hari`;

                return (
                  <div
                    key={agenda.id}
                    className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {agenda.nama}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {agenda.kategori} • {formatDate(agenda.tanggalMulai)}
                        {agenda.tanggalAkhir && ` - ${formatDate(agenda.tanggalAkhir)}`}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap ml-3">
                      {daysText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}