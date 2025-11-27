// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  console.log('📤 Upload API called');
  
  try {
    // ✅ Gunakan getServerSession, bukan auth()
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'EXISTS' : 'NULL');
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authorized:', session.user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('❌ No file in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExtension}`;
    
    console.log('📝 Generated filename:', fileName);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    console.log('📂 Upload directory:', uploadDir);
    
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('✅ Directory ensured');
    } catch (error: any) {
      console.log('⚠️ Directory might exist:', error.message);
    }

    // Convert file to buffer and save
    console.log('💾 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    
    console.log('💾 Writing file to:', filePath);
    await writeFile(filePath, buffer);
    console.log('✅ File written successfully');

    // Return the public URL
    const fileUrl = `/uploads/${fileName}`;
    console.log('🔗 File URL:', fileUrl);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + error.message },
      { status: 500 }
    );
  }
}