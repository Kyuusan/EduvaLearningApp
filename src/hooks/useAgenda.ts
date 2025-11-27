// hooks/useAgenda.ts

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export interface Agenda {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
}

interface UseAgendaReturn {
  agendas: Agenda[];
  loading: boolean;
  error: string | null;
  fetchAgendas: () => Promise<void>;
  addAgenda: (
    nama: string,
    kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
    tanggalMulai: string,
    tanggalAkhir?: string
  ) => Promise<Agenda | null>;
  updateAgenda: (
    id: number,
    nama: string,
    kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
    tanggalMulai: string,
    tanggalAkhir?: string
  ) => Promise<Agenda | null>;
  deleteAgenda: (id: number) => Promise<boolean>;
}

export function useAgenda(): UseAgendaReturn {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/agenda");

      if (!response.ok) {
        throw new Error("Gagal mengambil data agenda");
      }

      const data = await response.json();
      setAgendas(data.agendas || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAgenda = useCallback(
    async (
      nama: string,
      kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
      tanggalMulai: string,
      tanggalAkhir?: string
    ): Promise<Agenda | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/agenda", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama,
            kategori,
            tanggalMulai,
            tanggalAkhir: tanggalAkhir || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal menambahkan agenda"
          );
        }

        setAgendas((prev) => [...prev, data.agenda]);
        toast.success(data.message || "Agenda berhasil ditambahkan");
        return data.agenda;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAgenda = useCallback(
    async (
      id: number,
      nama: string,
      kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan",
      tanggalMulai: string,
      tanggalAkhir?: string
    ): Promise<Agenda | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/agenda", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            nama,
            kategori,
            tanggalMulai,
            tanggalAkhir: tanggalAkhir || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengupdate agenda"
          );
        }

        setAgendas((prev) =>
          prev.map((agenda) =>
            agenda.id === id ? data.agenda : agenda
          )
        );
        toast.success(data.message || "Agenda berhasil diupdate");
        return data.agenda;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAgenda = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/agenda", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menghapus agenda"
        );
      }

      setAgendas((prev) => prev.filter((agenda) => agenda.id !== id));
      toast.success(data.message || "Agenda berhasil dihapus");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    agendas,
    loading,
    error,
    fetchAgendas,
    addAgenda,
    updateAgenda,
    deleteAgenda,
  };
}