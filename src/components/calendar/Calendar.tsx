"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface Agenda {
  id: number;
  nama: string;
  kategori: "Ujian" | "Libur" | "Tanggal Merah" | "Kegiatan";
  tanggalMulai: string;
  tanggalAkhir: string | null;
}

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    onlyAdmin: boolean;
  };
}

const Calendar: React.FC = () => {
  const { data: session } = useSession();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const [startDay, setStartDay] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, "0");
    return { value: day, label: day };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = (currentYear + i).toString();
    return { value: year, label: year };
  });

  const calendarsEvents = {
    "Ujian": "danger",
    "Libur": "success",
    "Tanggal Merah": "warning",
    "Kegiatan": "primary",
  };

  const isAdmin = session?.user?.role === "admin";

  // Fetch agendas dari API
  const fetchAgendas = async () => {
    try {
      setLoading(true);
      // Gunakan endpoint berbeda untuk admin dan non-admin
      const endpoint = isAdmin ? "/api/admin/agenda" : "/api/kalendar";
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response status:", response.status);
        console.error("Response text:", errorText);
        throw new Error(`Gagal mengambil data agenda (${response.status})`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response bukan JSON - mungkin belum login");
      }

      const data = await response.json();
      const agendas = data.agendas || [];

      // Convert agendas to calendar events
      const calendarEvents = agendas.map((agenda: Agenda) => ({
        id: agenda.id.toString(),
        title: agenda.nama,
        start: agenda.tanggalMulai,
        end: agenda.tanggalAkhir || agenda.tanggalMulai,
        allDay: true,
        extendedProps: {
          calendar: agenda.kategori,
          onlyAdmin: true,
        },
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching agendas:", error);
      const errorMsg = error instanceof Error ? error.message : "Gagal memuat agenda";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch agendas on mount and when admin status changes
  useEffect(() => {
    if (session) {
      fetchAgendas();
    }
  }, [session?.user?.role]);

  const getTodayDateString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  const isDateBeforeToday = (dateStr: string) => {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date(getTodayDateString());
    return selectedDate < today;
  };

  const parseDateToComponents = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      year: date.getFullYear().toString(),
    };
  };

  const formatDateFromComponents = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return "";
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (startDay && startMonth && startYear) {
      setEventStartDate(formatDateFromComponents(startDay, startMonth, startYear));
    }
  }, [startDay, startMonth, startYear]);

  useEffect(() => {
    if (endDay && endMonth && endYear) {
      setEventEndDate(formatDateFromComponents(endDay, endMonth, endYear));
    }
  }, [endDay, endMonth, endYear]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!isAdmin) {
      toast.error("Hanya admin yang dapat menambahkan event");
      return;
    }
    resetModalFields();

    const startDate = parseDateToComponents(selectInfo.startStr);
    setStartDay(startDate.day);
    setStartMonth(startDate.month);
    setStartYear(startDate.year);

    const endDateStr = selectInfo.endStr || selectInfo.startStr;
    const endDate = parseDateToComponents(endDateStr);
    setEndDay(endDate.day);
    setEndMonth(endDate.month);
    setEndYear(endDate.year);

    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!isAdmin) {
      toast.error("Hanya admin yang dapat mengedit event");
      return;
    }
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);

    if (event.start) {
      const startDate = parseDateToComponents(event.start.toISOString());
      setStartDay(startDate.day);
      setStartMonth(startDate.month);
      setStartYear(startDate.year);
    }

    if (event.end) {
      const endDate = parseDateToComponents(event.end.toISOString());
      setEndDay(endDate.day);
      setEndMonth(endDate.month);
      setEndYear(endDate.year);
    }

    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!isAdmin) {
      toast.error("Hanya admin yang dapat memanipulasi event");
      closeModal();
      return;
    }

    if (!eventTitle || !eventStartDate || !eventLevel) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    if (isDateBeforeToday(eventStartDate)) {
      toast.error("Tanggal mulai tidak boleh sebelum hari ini");
      return;
    }

    if (eventEndDate && eventEndDate < eventStartDate) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
      return;
    }

    if (eventEndDate && isDateBeforeToday(eventEndDate)) {
      toast.error("Tanggal selesai tidak boleh sebelum hari ini");
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedEvent) {
        // UPDATE
        const response = await fetch("/api/admin/agenda", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: parseInt(selectedEvent.id as string),
            nama: eventTitle,
            kategori: eventLevel,
            tanggalMulai: eventStartDate,
            tanggalAkhir: eventEndDate || null,
          }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response bukan JSON - cek login & authorization");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengupdate agenda");
        }

        toast.success("Agenda berhasil diupdate");
      } else {
        // CREATE
        console.log("📝 Creating agenda:", {
          nama: eventTitle,
          kategori: eventLevel,
          tanggalMulai: eventStartDate,
          tanggalAkhir: eventEndDate || null,
        });

        const response = await fetch("/api/admin/agenda", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: eventTitle,
            kategori: eventLevel,
            tanggalMulai: eventStartDate,
            tanggalAkhir: eventEndDate || null,
          }),
        });

        console.log("📡 Response status:", response.status);
        console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text();
          console.error("❌ Response is not JSON:", responseText.substring(0, 200));
          throw new Error("Response bukan JSON - cek login & authorization");
        }

        const data = await response.json();
        console.log("✅ Response data:", data);

        if (!response.ok) {
          throw new Error(data.message || "Gagal menambahkan agenda");
        }

        toast.success("Agenda berhasil ditambahkan");
      }

      // Refresh data
      await fetchAgendas();
      closeModal();
      resetModalFields();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(errorMessage);
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!isAdmin) {
      toast.error("Hanya admin yang dapat menghapus event");
      return;
    }

    if (selectedEvent) {
      if (confirm("Apakah Anda yakin ingin menghapus agenda ini?")) {
        setIsSubmitting(true);

        try {
          const response = await fetch("/api/admin/agenda", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: parseInt(selectedEvent.id as string),
            }),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response bukan JSON - cek login & authorization");
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Gagal menghapus agenda");
          }

          toast.success("Agenda berhasil dihapus");

          // Refresh data
          await fetchAgendas();
          closeModal();
          resetModalFields();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Terjadi kesalahan";
          toast.error(errorMessage);
          console.error("Error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventLevel("");
    setSelectedEvent(null);

    setStartDay("");
    setStartMonth("");
    setStartYear(new Date().getFullYear().toString());
    setEndDay("");
    setEndMonth("");
    setEndYear(new Date().getFullYear().toString());

    setEventStartDate("");
    setEventEndDate("");
  };

  const handleOpenModal = () => {
    if (!isAdmin) {
      toast.error("Hanya admin yang dapat menambahkan event");
      return;
    }
    resetModalFields();
    openModal();
  };

  if (loading) {
    return (
      <div className="overflow-x-scroll overflow-y-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-full h-96">
          <p className="text-gray-600 dark:text-gray-400">Memuat agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-scroll overflow-y-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: isAdmin ? "addEventButton" : "",
            center: "title",
            right: "prev,next",
          }}
          events={events}
          selectable={isAdmin}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Tambah Event +",
              click: handleOpenModal,
            },
          }}
          editable={isAdmin}
          selectMirror={true}
          dayMaxEvents={true}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Edit Agenda Sekolah" : "Tambah Agenda Sekolah"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola agenda sekolah: tambahkan atau edit jadwal kegiatan, ujian, dan libur sekolah
            </p>
          </div>
          <div className="mt-8">
            <div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Judul Agenda
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Contoh: Ujian Akhir Semester"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Kategori Agenda
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <div key={key} className="n-chk">
                    <div
                      className={`form-check form-check-${value} form-check-inline`}
                    >
                      <label
                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400 cursor-pointer"
                        htmlFor={`modal${key}`}
                      >
                        <span className="relative">
                          <input
                            className="sr-only form-check-input"
                            type="radio"
                            name="event-level"
                            value={key}
                            id={`modal${key}`}
                            checked={eventLevel === key}
                            onChange={() => setEventLevel(key)}
                          />
                          <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                            <span
                              className={`h-2 w-2 rounded-full bg-white ${
                                eventLevel === key ? "block" : "hidden"
                              }`}
                            ></span>
                          </span>
                        </span>
                        {key}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tanggal Mulai
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Tanggal</option>
                    {days.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Bulan</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              {isDateBeforeToday(eventStartDate) && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ⚠️ Tanggal tidak boleh sebelum hari ini
                </p>
              )}
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tanggal Selesai (Opsional)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Tanggal</option>
                    {days.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="">Bulan</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              {eventEndDate && eventEndDate < eventStartDate && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ⚠️ Tanggal selesai tidak boleh sebelum tanggal mulai
                </p>
              )}
              {eventEndDate && isDateBeforeToday(eventEndDate) && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ⚠️ Tanggal selesai tidak boleh sebelum hari ini
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            {selectedEvent && (
              <button
                onClick={handleDeleteEvent}
                disabled={isSubmitting}
                type="button"
                className="flex w-full justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 sm:w-auto"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Event"}
              </button>
            )}
            <button
              onClick={closeModal}
              disabled={isSubmitting}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Tutup
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              disabled={isSubmitting}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {isSubmitting
                ? "Memproses..."
                : selectedEvent
                ? "Update Agenda"
                : "Tambah Agenda"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const calendar = eventInfo.event.extendedProps.calendar;

  const colorStyles: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
  > = {
    Ujian: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-l-4 border-red-500",
      dot: "bg-red-500",
    },
    Libur: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-l-4 border-green-500",
      dot: "bg-green-500",
    },
    "Tanggal Merah": {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-l-4 border-orange-500",
      dot: "bg-orange-500",
    },
    Kegiatan: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-l-4 border-blue-500",
      dot: "bg-blue-500",
    },
  };

  const style = colorStyles[calendar] || colorStyles["Kegiatan"];

  return (
    <div
      className={`flex items-center gap-2 p-1.5 px-2 rounded ${style.bg} ${style.text} ${style.border} cursor-pointer hover:opacity-80 transition-opacity`}
    >
      <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{eventInfo.event.title}</div>
        {eventInfo.timeText && (
          <div className="text-xs opacity-75">{eventInfo.timeText}</div>
        )}
      </div>
    </div>
  );
};

export default Calendar;