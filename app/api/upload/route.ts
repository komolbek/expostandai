import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// For local development, files are stored in /public/uploads
// For production, replace with cloud storage (S3, Cloudinary, etc.)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    // Support both 'file' (single) and 'files' (multiple) field names
    let files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      const singleFile = formData.get('file') as File | null
      if (singleFile) {
        files = [singleFile]
      }
    }
    const inquiryId = formData.get('inquiryId') as string || 'temp'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    const inquiryUploadDir = path.join(UPLOAD_DIR, inquiryId)
    if (!existsSync(inquiryUploadDir)) {
      await mkdir(inquiryUploadDir, { recursive: true })
    }

    const uploadedFiles: Array<{
      id: string
      name: string
      url: string
      type: string
      size: number
    }> = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}-${safeName}`
      const filepath = path.join(inquiryUploadDir, filename)

      await writeFile(filepath, buffer)

      uploadedFiles.push({
        id: `${timestamp}`,
        name: file.name,
        url: `/uploads/${inquiryId}/${filename}`,
        type: file.type,
        size: file.size,
      })
    }

    // Return both formats for compatibility
    // 'url' for single file upload (frontend expects this)
    // 'files' for multiple file uploads
    return NextResponse.json({
      success: true,
      url: uploadedFiles[0]?.url, // For single file compatibility
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
