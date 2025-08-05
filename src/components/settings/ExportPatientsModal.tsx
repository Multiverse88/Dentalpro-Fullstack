'use client';

import { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle, Database } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ExportPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOptions {
  format: 'csv' | 'excel';
  includeBasicInfo: boolean;
  includeTreatments: boolean;
  includeTeethConditions: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export function ExportPatientsModal({ isOpen, onClose }: ExportPatientsModalProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeBasicInfo: true,
    includeTreatments: true,
    includeTeethConditions: true,
  });
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/patients/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_pasien_${new Date().toISOString().split('T')[0]}.${options.format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExported(true);
      showToast({
        type: 'success',
        title: 'Export Berhasil',
        message: 'Data pasien berhasil diexport'
      });
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        type: 'error',
        title: 'Export Gagal',
        message: 'Terjadi kesalahan saat export data'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    setExported(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Export Data Pasien</h2>
              <p className="text-sm text-gray-600">Download data pasien ke file CSV atau Excel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!exported ? (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Format File
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, format: 'excel' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      options.format === 'excel'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileSpreadsheet className="w-6 h-6 mb-2" />
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-sm text-gray-600">Mendukung multiple sheets</div>
                  </button>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, format: 'csv' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      options.format === 'csv'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Database className="w-6 h-6 mb-2" />
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-sm text-gray-600">Simple comma-separated</div>
                  </button>
                </div>
              </div>

              {/* Data Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Data yang akan diexport
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeBasicInfo}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeBasicInfo: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Informasi Dasar Pasien (nama, tanggal lahir, kontak, alamat)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeTreatments}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTreatments: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Riwayat Perawatan (tanggal, jenis perawatan, biaya)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeTeethConditions}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTeethConditions: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Kondisi Gigi Terkini (odontogram, status gigi)
                    </span>
                  </label>
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter Tanggal Perawatan (opsional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dari</label>
                    <input
                      type="date"
                      value={options.dateFrom || ''}
                      onChange={(e) => setOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                    <input
                      type="date"
                      value={options.dateTo || ''}
                      onChange={(e) => setOptions(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting || (!options.includeBasicInfo && !options.includeTreatments && !options.includeTeethConditions)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengexport...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Export Berhasil!
              </h3>
              <p className="text-gray-600 mb-6">
                File telah didownload ke komputer Anda
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
