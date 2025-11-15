import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const files = db.prepare(`
      SELECT id, data_type, source, processed_data, month_year, created_at
      FROM financial_data
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId) as any[];

    const filesWithStatus = files.map(file => {
      const isProcessed = file.processed_data !== null;
      const processedData = isProcessed ? JSON.parse(file.processed_data) : null;
      const hasError = processedData?.error !== undefined;

      return {
        id: file.id,
        dataType: file.data_type,
        source: file.source,
        status: hasError ? 'failed' : (isProcessed ? 'processed' : 'processing'),
        processed: isProcessed,
        monthYear: file.month_year,
        createdAt: file.created_at,
        error: processedData?.error || null
      };
    });

    return NextResponse.json({
      files: filesWithStatus,
      total: files.length,
      processed: files.filter(f => f.processed_data !== null).length,
      processing: files.filter(f => f.processed_data === null).length
    });
  } catch (error: any) {
    console.error('Error fetching user files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user files' },
      { status: 500 }
    );
  }
}

