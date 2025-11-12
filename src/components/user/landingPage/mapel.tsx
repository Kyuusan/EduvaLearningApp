import { Poppins } from "next/font/google";
import clsx from "clsx";

interface MapelProps {
  nama: string;
  warna: string;
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const Mapel: React.FC<MapelProps> = ({ nama, warna }) => (
  <div
    className={clsx(
      "inline-flex items-center p-4 rounded-xl text-sm font-medium",
      "transition-all duration-200 ease-in-out hover:scale-[1.04]",
      "border border-gray-200 shadow-sm whitespace-nowrap mx-1",
      poppins.className,
      warna
    )}
  >
    <span>{nama}</span>
  </div>
);

export default Mapel;
