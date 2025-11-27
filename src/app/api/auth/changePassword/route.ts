// app/api/auth/change-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { changePassword } from "../../../../../lib/action";

export async function POST(request: NextRequest) {
  try {
    console.log("Change Password API Route Called");

    // ============= AUTHENTICATION CHECK =============
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      console.log("Unauthorized - No session or email");
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized - Anda belum login" 
        },
        { status: 401 }
      );
    }

    console.log("User authenticated:", session.user.email);

    // ============= PARSE REQUEST BODY =============
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    console.log("Request body received");

    // ============= VALIDATION =============
    if (!oldPassword || !newPassword) {
      console.log("Missing oldPassword or newPassword");
      return NextResponse.json(
        { 
          success: false,
          message: "Password lama dan baru harus diisi" 
        },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (newPassword.length < 8) {
      console.log("New password too short");
      return NextResponse.json(
        { 
          success: false,
          message: "Password baru harus minimal 8 karakter" 
        },
        { status: 400 }
      );
    }

    // Validasi password tidak sama
    if (oldPassword === newPassword) {
      console.log("Old and new password are the same");
      return NextResponse.json(
        { 
          success: false,
          message: "Password baru harus berbeda dengan password lama" 
        },
        { status: 400 }
      );
    }

    // ============= CALL CHANGE PASSWORD ACTION =============
    console.log("Calling changePassword action...");

    const result = await changePassword({
      email: session.user.email,
      oldPassword,
      newPassword
    });

    console.log("Change password action completed:", {
      success: result.success,
      userId: result.userId
    });

    // ============= SUCCESS RESPONSE =============
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        userId: result.userId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Change password API error:", error);

    // ============= ERROR HANDLING =============
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Terjadi kesalahan saat mengubah password";

    // Tentukan status code berdasarkan error message
    let statusCode = 500;
    
    if (errorMessage.includes("tidak ditemukan") || 
        errorMessage.includes("tidak terdaftar")) {
      statusCode = 404;
    } else if (errorMessage.includes("tidak sesuai") || 
               errorMessage.includes("tidak valid") ||
               errorMessage.includes("harus berbeda")) {
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      { status: statusCode }
    );
  }
}