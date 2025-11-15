import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import db from '@/lib/db';
import { DataPipeline } from '@/lib/data-pipeline';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const dataType = formData.get('dataType') as string;

    if (!file || !userId || !dataType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId, and dataType are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Excel
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate data type
    const allowedDataTypes = [
      'bank_statement', 
      'pay_stub', 
      'tax_return',
      'credit_card_statement',
      'loan_statement',
      'debt_statement',
      'bill'
    ];
    if (!allowedDataTypes.includes(dataType)) {
      return NextResponse.json(
        { error: `Invalid data type. Allowed types: ${allowedDataTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileId = randomUUID();
    
    // Get uploads path from environment variable or use default
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    const uploadDir = uploadsPath.startsWith('/')
      ? join(uploadsPath, userId)  // Absolute path
      : join(process.cwd(), uploadsPath, userId);  // Relative path
    
    await mkdir(uploadDir, { recursive: true });
    
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // Store metadata in database
    const dataId = randomUUID();
    const now = new Date().toISOString();
    
    // Extract month/year from filename or use current date
    const monthYear = extractMonthYear(file.name) || 
                     `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    db.prepare(`
      INSERT INTO financial_data (id, user_id, data_type, source, raw_data, month_year, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      dataId,
      userId,
      dataType,
      file.name,
      JSON.stringify({
        filePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: now
      }),
      monthYear,
      now
    );

    // Process document asynchronously
    // In production, use a job queue (BullMQ, AWS SQS, etc.)
    const pipeline = new DataPipeline();
    
    // Process in background (don't await to return quickly)
    pipeline.processFile(dataId).catch(error => {
      console.error('Background processing error:', error);
    });

    return NextResponse.json({
      id: dataId,
      status: 'uploaded',
      message: 'File uploaded successfully and queued for processing',
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

function extractMonthYear(fileName: string): string | null {
  // Try to extract date from filename patterns like:
  // "statement_2024_01.pdf", "paystub_01-2024.pdf", etc.
  const patterns = [
    /(\d{4})[_-](\d{1,2})/,
    /(\d{1,2})[_-](\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = fileName.match(pattern);
    if (match) {
      if (match[1].length === 4) {
        // Year first
        return `${match[1]}-${match[2].padStart(2, '0')}`;
      } else {
        // Month first
        return `${match[2]}-${match[1].padStart(2, '0')}`;
      }
    }
  }

  return null;
}

