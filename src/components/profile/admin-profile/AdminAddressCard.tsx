"use client";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins, Rubik } from "next/font/google";
import toast from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik"
});

interface ProfileData {
  id: number;
  nama: string;
  email: string;
  nisn?: string;
  kelas?: string;
  jurusan?: string;
  accses?: string;
  guruId?: number;
  createdAt?: string;
}

export default function AdminAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();

  // State untuk masing-masing field password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk form dan loading
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  //profile
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setLoadingForm(true);

    // Validasi input
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setFormError("Semua field harus diisi");
      setLoadingForm(false);
      return;
    }

    // Validasi password baru minimal 8 karakter
    if (formData.newPassword.length < 8) {
      setFormError("Password baru harus minimal 8 karakter");
      setLoadingForm(false);
      return;
    }

    // Validasi password baru dan konfirmasi cocok
    if (formData.newPassword !== formData.confirmPassword) {
      setFormError("Password baru dan konfirmasi tidak cocok");
      setLoadingForm(false);
      return;
    }

    // Validasi password lama dan baru tidak sama
    if (formData.oldPassword === formData.newPassword) {
      setFormError("Password baru harus berbeda dengan password lama");
      setLoadingForm(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      toast.success(data.message || "Password berhasil diubah");

      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Close modal
      closeModal();


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingForm(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/masuk");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data profil");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (status === "loading" || loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error/No Data State
  if (error || !profile || !session) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          {error || "Data profil tidak ditemukan"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Informasi Akun
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Nama Pengguna
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.nama}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Kata sandi
                </p>
                <div className="flex gap-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    ********
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              />
            </svg>
            Ubah
          </button>
        </div>
      </div>

      {/* Modal Edit Password */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Kata sandi
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Ubah kata sandi anda
            </p>
          </div>

          {formError && (
            <div className="mx-2 mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="text" 
                    placeholder="contoh@gmail.com"
                    value={session?.user?.email || ""}
                    readOnly
                  />
                </div>

                {/* Kata sandi lama */}
                <div className="relative">
                  <Label>Kata sandi lama</Label>
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="*******"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={loadingForm}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Kata sandi baru */}
                <div className="relative">
                  <Label>Kata sandi baru</Label>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi baru"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={loadingForm}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Konfirmasi kata sandi */}
                <div className="relative">
                  <Label>Konfirmasi kata sandi</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={loadingForm}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                disabled={loadingForm}
              >
                Tutup
              </Button>
              <Button 
                size="sm"
                disabled={loadingForm}
              >
                {loadingForm ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}