import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dataId: string }> }
) {
  try {
    const { dataId } = await params;

    const fileData = db.prepare(`
      SELECT id, user_id, data_type, source, processed_data, created_at
      FROM financial_data
      WHERE id = ?
    `).get(dataId) as any;

    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const isProcessed = fileData.processed_data !== null;
    const processedData = isProcessed ? JSON.parse(fileData.processed_data) : null;
    const hasError = processedData?.error !== undefined;

    return NextResponse.json({
      id: fileData.id,
      dataType: fileData.data_type,
      source: fileData.source,
      status: hasError ? 'failed' : (isProcessed ? 'processed' : 'processing'),
      processed: isProcessed,
      error: processedData?.error || null,
      createdAt: fileData.created_at,
      processedAt: isProcessed ? fileData.created_at : null
    });
  } catch (error: any) {
    console.error('Error fetching file status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch file status' },
      { status: 500 }
    );
  }
}

