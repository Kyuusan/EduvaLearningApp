import MapelCard from "../courseCard";
import { getCourseHistory } from "../../../../lib/userHome.action";

export default async function CourseHistory() {
  const historyCourses = await getCourseHistory();

  if (historyCourses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Belum ada riwayat belajar</p>
        <p className="text-sm mt-2">Mulai belajar untuk melihat riwayat di sini</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {historyCourses.map((course) => (
        <MapelCard
          key={course.id}
          courseId={course.id}
          namaMapel={course.nama}
          kategori={course.kategori.toLowerCase() as "umum" | "kejuruan"}
          kelas={[course.kelasNama || "Unknown"]}
          lastAccessed={(course as any).lastAccessedAt}
        />
      ))}
    </div>
  );
}