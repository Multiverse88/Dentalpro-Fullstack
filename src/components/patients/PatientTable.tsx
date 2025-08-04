'use client';

import Link from "next/link";

interface PatientTableProps {
  patients: {
    id: string;
    name: string;
    dateOfBirth: Date;
    gender: string;
    contact: string;
    address: string | null;
    treatments: {
      id: string;
      date: Date;
      type: string | null;
    }[];
  }[];
}

export function PatientTable({ patients }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <span className="text-6xl">🔍</span>
        </div>
        <p className="text-gray-500 text-lg">Tidak ada pasien yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nama
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal Lahir
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Kontak
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Perawatan Terakhir
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.map((patient, index) => (
              <tr 
                key={patient.id} 
                className="hover:bg-gray-50 transition-all duration-300 group"
                style={{
                  animationName: 'fadeInUp',
                  animationDuration: '0.5s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-sm text-gray-500">{patient.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{patient.contact}</div>
                  <div className="text-sm text-gray-500">{patient.address}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">
                    {patient.treatments[0]
                      ? new Date(patient.treatments[0].date).toLocaleDateString()
                      : 'Belum ada perawatan'}
                  </div>
                  {patient.treatments[0] && (
                    <div className="text-sm text-gray-500">
                      {patient.treatments[0].type}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
