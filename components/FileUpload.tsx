'use client';

import { useState, useRef } from 'react';
import { Button, Card, CardBody, Progress, Chip, Select, SelectItem } from '@heroui/react';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  fileName: string;
  dataType: string;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  progress?: number;
  error?: string;
}

interface FileUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export default function FileUpload({ userId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dataType, setDataType] = useState<string>('bank_statement');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('dataType', dataType);

    const tempId = `temp-${Date.now()}`;
    const newFile: UploadedFile = {
      id: tempId,
      fileName: file.name,
      dataType,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    try {
      const response = await fetch('/api/data/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update file status
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { ...f, id: result.id, status: 'processing' as const }
          : f
      ));

      // Poll for processing status
      pollFileStatus(result.id, tempId);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { ...f, status: 'failed' as const, error: error.message }
          : f
      ));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const pollFileStatus = async (dataId: string, tempId: string) => {
    const maxAttempts = 30; // 30 attempts = 30 seconds
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/data/status/${dataId}`);
        const status = await response.json();

        if (status.status === 'processed') {
          setUploadedFiles(prev => prev.map(f => 
            f.id === tempId 
              ? { ...f, id: dataId, status: 'processed' as const }
              : f
          ));
          if (onUploadComplete) {
            onUploadComplete();
          }
        } else if (status.status === 'failed') {
          setUploadedFiles(prev => prev.map(f => 
            f.id === tempId 
              ? { ...f, id: dataId, status: 'failed' as const, error: status.error }
              : f
          ));
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        } else {
          // Timeout - assume still processing
          setUploadedFiles(prev => prev.map(f => 
            f.id === tempId 
              ? { ...f, id: dataId, status: 'processing' as const }
              : f
          ));
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    setTimeout(poll, 2000); // Start polling after 2 seconds
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Financial Documents</h3>
          <p className="text-sm text-default-600 mb-4">
            Upload financial documents (bank statements, pay stubs, bills, loans, credit cards, debt statements) to automatically calculate your comprehensive risk profile
          </p>
        </div>

        <div className="flex gap-4 items-end">
          <Select
            label="Document Type"
            selectedKeys={[dataType]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setDataType(selected);
            }}
            className="flex-1"
          >
            <SelectItem key="bank_statement">
              Bank Statement
            </SelectItem>
            <SelectItem key="pay_stub">
              Pay Stub
            </SelectItem>
            <SelectItem key="tax_return">
              Tax Return
            </SelectItem>
            <SelectItem key="credit_card_statement">
              Credit Card Statement
            </SelectItem>
            <SelectItem key="loan_statement">
              Loan Statement
            </SelectItem>
            <SelectItem key="debt_statement">
              Debt Statement
            </SelectItem>
            <SelectItem key="bill">
              Bill (Utility, Rent, etc.)
            </SelectItem>
          </Select>

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              as="span"
              color="primary"
              startContent={<Upload className="w-4 h-4" />}
              isLoading={uploading}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-semibold">Uploaded Files</p>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" variant="flat" color={getStatusColor(file.status) as any}>
                        {file.status}
                      </Chip>
                      <span className="text-xs text-default-500 capitalize">
                        {file.dataType.replace('_', ' ')}
                      </span>
                    </div>
                    {file.error && (
                      <p className="text-xs text-danger mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                {file.status !== 'uploading' && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-default-500">
          <p>Supported formats: PDF, PNG, JPG, CSV (Max 10MB)</p>
          <p>Documents are processed securely and used to calculate your risk profile</p>
        </div>
      </CardBody>
    </Card>
  );
}

