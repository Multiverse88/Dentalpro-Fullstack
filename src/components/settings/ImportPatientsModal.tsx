'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import * as XLSX from 'xlsx';

interface ImportPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatientData {
  name: string;
  dateOfBirth: string;
  gender: string;
  contact: string;
  address?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export function ImportPatientsModal({ isOpen, onClose }: ImportPatientsModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PatientData[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      showToast({
        type: 'error',
        title: 'Format File Tidak Valid',
        message: 'Silakan upload file CSV atau Excel (.xlsx, .xls)'
      });
      return;
    }

    setFile(file);
    await parseFile(file);
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      let jsonData: Array<Record<string, unknown>> = [];

      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(data);
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      // Validate and transform data
      const patients: PatientData[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: Record<string, unknown>, index: number) => {
        const rowNum = index + 2; // +2 because index starts at 0 and we skip header

        // Validate required fields
        if (!row.name || !row.dateOfBirth || !row.gender || !row.contact) {
          errors.push(`Baris ${rowNum}: Data tidak lengkap (name, dateOfBirth, gender, contact diperlukan)`);
          return;
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(String(row.dateOfBirth))) {
          errors.push(`Baris ${rowNum}: Format tanggal lahir harus YYYY-MM-DD`);
          return;
        }

        // Validate gender
        const validGenders = ['Laki-laki', 'Perempuan', 'L', 'P', 'Male', 'Female'];
        let gender = String(row.gender);
        if (gender === 'L' || gender === 'Male') gender = 'Laki-laki';
        if (gender === 'P' || gender === 'Female') gender = 'Perempuan';
        
        if (!validGenders.includes(String(row.gender)) && !['Laki-laki', 'Perempuan'].includes(gender)) {
          errors.push(`Baris ${rowNum}: Gender harus 'Laki-laki' atau 'Perempuan'`);
          return;
        }

        patients.push({
          name: String(row.name).trim(),
          dateOfBirth: String(row.dateOfBirth),
          gender: gender,
          contact: String(row.contact).trim(),
          address: row.address ? String(row.address).trim() : undefined
        });
      });

      if (errors.length > 0) {
        showToast({
          type: 'error',
          title: 'Error Parsing File',
          message: `${errors.length} error ditemukan. Periksa format data.`
        });
      }

      setPreviewData(patients);
    } catch (error) {
      console.error('Error parsing file:', error);
      showToast({
        type: 'error',
        title: 'Error Membaca File',
        message: 'Tidak dapat membaca file. Pastikan format file benar.'
      });
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    try {
      const response = await fetch('/api/patients/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patients: previewData }),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        showToast({
          type: 'success',
          title: 'Import Berhasil',
          message: `${result.imported} pasien berhasil diimport`
        });
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast({
        type: 'error',
        title: 'Import Gagal',
        message: 'Terjadi kesalahan saat import data'
      });
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Import Data Pasien</h2>
              <p className="text-sm text-gray-600">Upload file CSV atau Excel dengan data pasien</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!file && !importResult && (
            <>
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Drop file di sini atau klik untuk upload
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mendukung file CSV, Excel (.xlsx, .xls)
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Pilih File
                </button>
              </div>

              {/* Template Download */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Template Excel</h4>
                <p className="text-sm text-blue-600 mb-3">
                  Download template untuk format yang benar
                </p>
                <button
                  onClick={() => {
                    // Create template file
                    const template = [
                      ['name', 'dateOfBirth', 'gender', 'contact', 'address'],
                      ['John Doe', '1990-01-15', 'Laki-laki', '081234567890', 'Jl. Contoh No. 123'],
                      ['Jane Smith', '1985-05-20', 'Perempuan', '081234567891', 'Jl. Sample No. 456']
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(template);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Template');
                    XLSX.writeFile(wb, 'template_import_pasien.xlsx');
                  }}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                >
                  Download Template
                </button>
              </div>
            </>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && !importResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Preview Data</h3>
                <div className="text-sm text-gray-600">
                  {previewData.length} pasien akan diimport
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Nama</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Tanggal Lahir</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Gender</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Kontak</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Alamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.slice(0, 10).map((patient, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{patient.name}</td>
                          <td className="px-4 py-3">{patient.dateOfBirth}</td>
                          <td className="px-4 py-3">{patient.gender}</td>
                          <td className="px-4 py-3">{patient.contact}</td>
                          <td className="px-4 py-3">{patient.address || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                    ... dan {previewData.length - 10} data lainnya
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Ulang
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengimport...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Import {previewData.length} Pasien</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              <div className="text-center">
                {importResult.success ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {importResult.success ? 'Import Berhasil!' : 'Import Selesai dengan Error'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                  <div className="text-sm text-green-700">Berhasil</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-red-700">Gagal</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
