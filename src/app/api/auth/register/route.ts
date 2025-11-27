import { NextRequest, NextResponse } from "next/server";
import { registerSiswa } from "../../../../../lib/action";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const { nisn, nama, kelas, jurusan, email } = body;

    // Validasi basic
    if (!nisn || !nama || !kelas || !jurusan || !email) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    console.log(" Data validated, calling registerSiswa...");

    // Panggil action dengan object
    await registerSiswa({ nisn, nama, kelas, jurusan, email });

    console.log(" Registration successful!");

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Akun Anda menunggu persetujuan admin.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(" Registration API error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat registrasi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}