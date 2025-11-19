"use client"
import MapelCard from "@/components/user/courseCard"

export default function Course() {
  return (
    <>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <MapelCard
          namaMapel="Matematika"
          kategori="umum"
          kelas={["X PPLG 1", "X PPLG 2"]}
        />
        <MapelCard
          namaMapel="Pemrograman Web"
          kategori="kejuruan"
          kelas={["XI PPLG 1", "XI PPLG 2", "XI PPLG 3"]}
        />
        <MapelCard
          namaMapel="Bahasa Indonesia"
          kategori="umum"
          kelas={["X PPLG 1"]}
        />
        <MapelCard
          namaMapel="Basis Data"
          kategori="kejuruan"
          kelas={["XII PPLG 1", "XII PPLG 2"]}
        />
        <MapelCard
          namaMapel="Basis Data"
          kategori="kejuruan"
          kelas={["XII PPLG 1", "XII PPLG 2"]}
        />
        <MapelCard
          namaMapel="Basis Data"
          kategori="kejuruan"
          kelas={["XII PPLG 1", "XII PPLG 2"]}
        />
      </div>
    </>
  )
}