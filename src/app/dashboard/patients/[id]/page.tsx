'use client';

import { useState, useEffect } from 'react';
import { getPatientById } from "./actions";
import { getPatientTeethConditions } from "./teeth-actions";
import { Card } from "@/components/ui/Card";
import { TreatmentTimeline } from "@/components/patients/TreatmentTimeline";
import { Odontogram } from "@/components/patients/Odontogram";
import { AddTreatmentModal } from "@/components/patients/AddTreatmentModal";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Phone, MapPin, Plus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  contact: string;
  address: string | null;
  treatments: Treatment[];
}

interface Treatment {
  id: string;
  date: Date;
  type: string | null;
  description: string;
  teeth: number[] | string;
  notes: string | null;
  cost: number | null;
  performedBy: string | null;
}

interface ToothCondition {
  number: number;
  condition: 'healthy' | 'filled' | 'decayed' | 'extracted' | 'crown' | 'root_canal';
  notes?: string;
  lastTreatment?: Date;
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [patient, setPatient] = useState<any>(null);
  const [teethConditions, setTeethConditions] = useState<ToothCondition[]>([]);
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
  const [editTreatment, setEditTreatment] = useState<Treatment | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate age
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;
        const [patientData, teethData] = await Promise.all([
          getPatientById(id),
          getPatientTeethConditions(id)
        ]);
        setPatient(patientData);
        setTeethConditions(teethData);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params]);

  const handleTreatmentAdded = async () => {
    // Refresh patient data after adding treatment
    try {
      const { id } = await params;
      const [patientData, teethData] = await Promise.all([
        getPatientById(id),
        getPatientTeethConditions(id)
      ]);
      setPatient(patientData);
      setTeethConditions(teethData);
      // Clear selected teeth after successful treatment addition
      setSelectedTeeth([]);
    } catch (error) {
      console.error('Error refreshing patient data:', error);
    }
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditTreatment(treatment);
    setIsAddTreatmentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddTreatmentModalOpen(false);
    setEditTreatment(null);
    // Keep selected teeth when closing modal so user can continue selecting
  };

  const handleToothClick = (toothNumber: number) => {
    // This is called when a tooth is clicked in the odontogram
    console.log('Tooth clicked:', toothNumber);
  };

  const handleOpenAddTreatmentModal = () => {
    setIsAddTreatmentModalOpen(true);
    // selectedTeeth will be passed to modal
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Pasien tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/patients"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Pasien
        </Link>
      </div>

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
            <p className="text-gray-600 flex items-center mt-1">
              <User className="w-4 h-4 mr-1" />
              {patient.gender} • {calculateAge(patient.dateOfBirth)} tahun
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}
              </span>
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {patient.contact}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card variant="default">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informasi Pasien
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nama Lengkap</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{patient.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tanggal Lahir</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(patient.dateOfBirth).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Usia</dt>
                  <dd className="mt-1 text-sm text-gray-900">{calculateAge(patient.dateOfBirth)} tahun</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Jenis Kelamin</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kontak</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.contact}</dd>
                </div>
                {patient.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Alamat
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.address}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Perawatan</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">
                    {patient.treatments.length} perawatan
                  </dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>

        {/* Odontogram and Treatment Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Odontogram with selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Peta Gigi (Odontogram)</h3>
              {selectedTeeth.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedTeeth.length} gigi dipilih
                  </span>
                  <button
                    onClick={handleOpenAddTreatmentModal}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Perawatan</span>
                  </button>
                </div>
              )}
            </div>
            <Odontogram 
              teeth={teethConditions} 
              readOnly={false}
              selectedTeeth={selectedTeeth}
              onSelectionChange={setSelectedTeeth}
              onToothClick={handleToothClick}
            />
          </div>
          
          {/* Treatment Timeline with Add Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Riwayat Perawatan</h3>
              <button
                onClick={handleOpenAddTreatmentModal}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Perawatan</span>
              </button>
            </div>
            <TreatmentTimeline 
              treatments={patient.treatments} 
              patientId={patient.id}
              onEditTreatment={handleEditTreatment}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Treatment Modal */}
      <AddTreatmentModal
        isOpen={isAddTreatmentModalOpen}
        onClose={handleCloseModal}
        onTreatmentAdded={handleTreatmentAdded}
        patientId={patient.id}
        patientName={patient.name}
        editTreatment={editTreatment}
        selectedTeeth={selectedTeeth}
      />
    </div>
  );
}
