import type { Metadata } from "next";
import React from "react";
import MonthlyTarget from "@/components/dashboard/MonthlyTarget";
import { LMSDashboardAdmin } from "@/components/dashboard/LmsDashboardAdmin";
import VisiMisiCard from "@/components/dashboard/MonthlySalesChart";


export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <LMSDashboardAdmin />

        <VisiMisiCard />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

    </div>
  );
}
