'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { PatientTable } from '@/components/patients/PatientTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { AddPatientModal } from '@/components/patients/AddPatientModal';
import { searchPatients } from './actions';

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patients, setPatients] = useState<Array<{
    id: string;
    name: string;
    dateOfBirth: Date;
    gender: string;
    contact: string;
    address: string | null;
    treatments: Array<{
      id: string;
      date: Date;
      type: string | null;
    }>;
  }>>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function fetchPatients() {
      const results = await searchPatients(debouncedSearch);
      setPatients(results);
    }
    fetchPatients();
  }, [debouncedSearch]);

  const handlePatientAdded = async () => {
    // Refresh the patient list when a new patient is added
    const results = await searchPatients(searchQuery);
    setPatients(results);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Daftar Pasien
          </h2>
          <p className="text-gray-600">Kelola data pasien dengan mudah</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md flex items-center space-x-2"
        >
          <span>+</span>
          <span>Tambah Pasien</span>
        </button>
      </div>

      <div className="flex items-center justify-center">
        <SearchInput
          placeholder="Cari nama atau kontak pasien..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-lg"
        />
      </div>

      <PatientTable patients={patients} />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
    </div>
  );
}
