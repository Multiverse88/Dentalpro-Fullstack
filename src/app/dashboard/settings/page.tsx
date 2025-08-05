'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Upload, Download, Database, Users, FileText, Settings as SettingsIcon, LogOut, Shield, User } from 'lucide-react';
import { ImportPatientsModal } from '@/components/settings/ImportPatientsModal';
import { ExportPatientsModal } from '@/components/settings/ExportPatientsModal';
import { signOut, useSession } from 'next-auth/react';

export default function SettingsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
            Pengaturan Sistem
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola data pasien, import/export, dan konfigurasi sistem
          </p>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Data */}
        <Card variant="default">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Import Data Pasien</h3>
                <p className="text-sm text-gray-600">Upload data pasien dari file CSV atau Excel</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Format yang didukung:</strong>
              </div>
              <ul className="text-xs text-gray-500 space-y-1 ml-4">
                <li>• CSV (.csv)</li>
                <li>• Excel (.xlsx, .xls)</li>
                <li>• Encoding: UTF-8</li>
              </ul>
              
              <div className="text-sm text-gray-600">
                <strong>Kolom yang diperlukan:</strong>
              </div>
              <ul className="text-xs text-gray-500 space-y-1 ml-4">
                <li>• name (Nama Lengkap)</li>
                <li>• dateOfBirth (YYYY-MM-DD)</li>
                <li>• gender (Laki-laki/Perempuan)</li>
                <li>• contact (No. Telepon)</li>
                <li>• address (Alamat - opsional)</li>
              </ul>
            </div>
            
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data Pasien</span>
            </button>
          </div>
        </Card>

        {/* Export Data */}
        <Card variant="default">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Export Data Pasien</h3>
                <p className="text-sm text-gray-600">Download data pasien ke file CSV atau Excel</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Data yang akan diexport:</strong>
              </div>
              <ul className="text-xs text-gray-500 space-y-1 ml-4">
                <li>• Informasi dasar pasien</li>
                <li>• Riwayat perawatan</li>
                <li>• Kondisi gigi terkini</li>
                <li>• Statistik perawatan</li>
              </ul>
            </div>
            
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export Data Pasien</span>
            </button>
          </div>
        </Card>
      </div>

      {/* System Information */}
      <Card variant="default">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Informasi Sistem
          </h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-sm text-gray-600">Total Pasien</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-sm text-gray-600">Total Perawatan</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">Neon</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security & Account Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Keamanan & Akun</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Info */}
          <Card variant="default">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Informasi Akun</h3>
                  <p className="text-sm text-gray-600">Detail akun dan sesi login</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-800">{session?.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Nama:</span>
                  <span className="text-sm font-medium text-gray-800">{session?.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className="text-sm font-medium text-gray-800">{session?.user?.role || 'USER'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Status Sesi:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Aktif (24 jam)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Logout Section */}
          <Card variant="default">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Keamanan Sesi</h3>
                  <p className="text-sm text-gray-600">Kelola sesi login Anda</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Info Sesi JWT
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Sesi tersimpan di browser cookie</li>
                    <li>• Otomatis logout setelah 24 jam</li>
                    <li>• Token JWT signed dan aman</li>
                    <li>• HTTP-only cookie protection</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ImportPatientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      
      <ExportPatientsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
