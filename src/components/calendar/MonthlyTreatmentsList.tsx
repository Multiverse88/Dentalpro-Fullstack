'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Calendar, User, FileText, DollarSign, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Treatment {
  id: string;
  date: Date;
  type: string | null;
  description: string;
  cost: number | null;
  patient: {
    id: string;
    name: string;
    contact: string;
  };
}

interface MonthlyTreatmentsListProps {
  treatments: Treatment[];
  title?: string;
}

export function MonthlyTreatmentsList({ treatments, title = "Daftar Perawatan" }: MonthlyTreatmentsListProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group treatments by date
  const treatmentsByDate = treatments.reduce((acc, treatment) => {
    const dateKey = new Date(treatment.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>);

  // Sort dates
  const sortedDates = Object.keys(treatmentsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDayExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const getTreatmentTypeColor = (type: string | null) => {
    const colors = {
      'Pemeriksaan': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pembersihan': 'bg-green-100 text-green-800 border-green-200',
      'Penambalan': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pencabutan': 'bg-red-100 text-red-800 border-red-200',
      'Perawatan Saluran Akar': 'bg-purple-100 text-purple-800 border-purple-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  if (treatments.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="mb-4">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">Tidak ada perawatan</h3>
          <p className="text-gray-400">Belum ada perawatan yang dijadwalkan untuk periode ini</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {title}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {treatments.length} perawatan
          </span>
        </div>

        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dayTreatments = treatmentsByDate[dateKey];
            const isExpanded = expandedDays.has(dateKey);
            const date = new Date(dateKey);
            const totalCost = dayTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);

            return (
              <div key={dateKey} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Date Header */}
                <div 
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleDayExpansion(dateKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {date.getDate()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {date.toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {date.toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {dayTreatments.length} perawatan
                          {totalCost > 0 && (
                            <span className="ml-2 text-green-600 font-medium">
                              • Rp {totalCost.toLocaleString('id-ID')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isExpanded ? 'Tutup' : 'Lihat Detail'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Treatments List */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {dayTreatments.map((treatment, index) => (
                      <div 
                        key={treatment.id}
                        className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <Link 
                                href={`/dashboard/patients/${treatment.patient.id}`}
                                className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                              >
                                {treatment.patient.name}
                              </Link>
                            </div>
                            <p className="text-sm text-gray-500 ml-6">
                              {treatment.patient.contact}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(treatment.date).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {treatment.type && (
                              <span className={`text-xs px-2 py-1 rounded border ${getTreatmentTypeColor(treatment.type)}`}>
                                {treatment.type}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 mb-3">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-700 flex-1">{treatment.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <Link 
                            href={`/dashboard/patients/${treatment.patient.id}/treatments/${treatment.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Lihat Detail →
                          </Link>
                          {treatment.cost && (
                            <div className="flex items-center text-green-600 font-medium">
                              <DollarSign className="w-4 h-4 mr-1" />
                              Rp {treatment.cost.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
