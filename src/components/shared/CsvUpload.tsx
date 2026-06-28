import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { CsvImportResult } from '@/types';

interface CsvUploadProps {
  onUpload: (file: File) => Promise<CsvImportResult>;
  onSuccess?: (result: CsvImportResult) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function CsvUpload({ onUpload, onSuccess }: CsvUploadProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a .csv file');
      setState('error');
      return;
    }

    setSelectedFile(file);
    setState('uploading');
    setErrorMsg('');

    try {
      const res = await onUpload(file);
      setResult(res);
      setState('success');
      onSuccess?.(res);
    } catch {
      setErrorMsg('Upload failed. Please check your file and try again.');
      setState('error');
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setErrorMsg('');
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (state === 'success' && result) {
    return (
      <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-emerald-50">
        <CheckCircle className="mx-auto mb-3 text-emerald-500" size={40} />
        <p className="font-semibold text-emerald-700 text-lg">Import Successful!</p>
        <p className="text-emerald-600 mt-1">
          {result.imported} contacts imported
          {result.skipped > 0 && `, ${result.skipped} skipped`}
        </p>
        {selectedFile && (
          <p className="text-xs text-emerald-500 mt-1">{selectedFile.name}</p>
        )}
        <Button variant="secondary" size="sm" className="mt-4" onClick={reset}>
          Upload Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
          'border-slate-300 hover:border-indigo-300 hover:bg-slate-50',
          state === 'error' && 'border-red-400 bg-red-50',
          state === 'uploading' && 'pointer-events-none opacity-70'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />

        {state === 'uploading' ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-10 w-10 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            <p className="text-slate-500 font-medium">Uploading & parsing CSV...</p>
          </div>
        ) : state === 'error' ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="text-red-400" size={40} />
            <p className="text-red-600 font-medium">{errorMsg}</p>
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-indigo-50 rounded-full">
              <Upload className="text-indigo-400" size={32} />
            </div>
            <div>
              <p className="font-semibold text-slate-700">
                Click to upload CSV
              </p>
              <p className="text-sm text-slate-400 mt-1">CSV files only · max 10MB</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">Expected CSV format:</p>
        <code className="text-xs text-slate-600">name, email, phone (opt), company (opt), tags (opt, comma-separated)</code>
      </div>
    </div>
  );
}
