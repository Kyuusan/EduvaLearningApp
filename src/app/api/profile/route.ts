
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProfile } from "../../../../lib/action";

export async function GET(request: NextRequest) {
  try {
    console.log("Profile API called");

    const session = await getServerSession(authOptions);

    // 2. Cek apakah user sudah login
    if (!session || !session.user) {
      console.log("Unauthorized No session");
      return NextResponse.json(
        { error: "Unauthorized", message: "Anda belum login" },
        { status: 401 }
      );
    }

    console.log("Session found:", {
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email,
    });

    const profile = await getProfile(session.user.id, session.user.role);

    // 4. Cek apakah profile ditemukan
    if (!profile) {
      console.log("Profile not found in database");
      return NextResponse.json(
        { 
          error: "Not Found", 
          message: "Profil tidak ditemukan di database" 
        },
        { status: 404 }
      );
    }

    console.log("Profile found:", {
      id: profile.id || (profile as any).guruId,
      nama: profile.nama,
      role: session.user.role,
    });

    return NextResponse.json(
      {
        success: true,
        profile: profile,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Profile API error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Terjadi kesalahan saat mengambil data profil" 
      },
      { status: 500 }
    );
  }
}