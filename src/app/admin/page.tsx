import type { Metadata } from "next";
import React from "react";
import AgendaTerdekat from "@/components/dashboard/AgendaTerdekat";
import {DataCards } from "@/components/dashboard/DataCards";
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
        <DataCards />

        <VisiMisiCard />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <AgendaTerdekat />
      </div>

    </div>
  );
}
