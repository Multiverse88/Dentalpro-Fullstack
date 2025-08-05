'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, DollarSign, FileText, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Treatment {
  id: string;
  date: Date;
  type: string | null;
  description: string;
  teeth: number[] | string; // JSON array
  notes: string | null;
  cost: number | null;
  performedBy: string | null;
}

interface TreatmentTimelineProps {
  treatments: Treatment[];
  patientId: string;
  onEditTreatment?: (treatment: Treatment) => void;
}

export function TreatmentTimeline({ treatments, patientId, onEditTreatment }: TreatmentTimelineProps) {
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  const toggleExpanded = (treatmentId: string) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(treatmentId)) {
      newExpanded.delete(treatmentId);
    } else {
      newExpanded.add(treatmentId);
    }
    setExpandedTreatments(newExpanded);
  };

  // Group treatments by year and month
  const groupedTreatments = treatments.reduce((acc, treatment) => {
    const date = new Date(treatment.date);
    const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
    const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    if (!acc[yearMonth]) {
      acc[yearMonth] = {
        label: monthYear,
        treatments: []
      };
    }
    acc[yearMonth].treatments.push(treatment);
    return acc;
  }, {} as Record<string, { label: string; treatments: Treatment[] }>);

  const formatTeeth = (teethData: number[] | string) => {
    try {
      const teeth = Array.isArray(teethData) ? teethData : JSON.parse(teethData as string);
      return teeth.join(', ');
    } catch {
      return 'Tidak diketahui';
    }
  };

  return (
    <div className="space-y-6">
      {treatments.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <div className="mb-4">
              <span className="text-6xl">🦷</span>
            </div>
            <p className="text-gray-500 text-lg">Belum ada riwayat perawatan</p>
            <p className="text-gray-400 text-sm mt-2">Mulai tambahkan perawatan untuk pasien ini</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTreatments).map(([key, group]) => (
            <div key={key}>
              <div className="sticky top-0 z-10 bg-gray-50 px-4 py-2 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {group.label}
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {group.treatments.length} perawatan
                  </span>
                </h4>
              </div>
              
              <div className="space-y-4">
                {group.treatments.map((treatment) => {
                  const isExpanded = expandedTreatments.has(treatment.id);
                  
                  return (
                    <Card key={treatment.id} className="transition-all duration-200 hover:shadow-lg">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(treatment.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              {treatment.type && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {treatment.type}
                                </span>
                              )}
                            </div>
                            <h5 className="font-semibold text-gray-800 mb-2">
                              {treatment.description}
                            </h5>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleExpanded(treatment.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            {onEditTreatment ? (
                              <button
                                onClick={() => onEditTreatment(treatment)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                            ) : (
                              <Link
                                href={`/dashboard/patients/${patientId}/treatments/${treatment.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t pt-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start space-x-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Gigi yang dirawat:</p>
                                  <p className="text-sm text-gray-600">{formatTeeth(treatment.teeth)}</p>
                                </div>
                              </div>
                              
                              {treatment.cost && (
                                <div className="flex items-start space-x-2">
                                  <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Biaya:</p>
                                    <p className="text-sm text-gray-600">
                                      Rp {treatment.cost.toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {treatment.performedBy && (
                                <div className="flex items-start space-x-2">
                                  <User className="w-4 h-4 text-gray-400 mt-1" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Dokter:</p>
                                    <p className="text-sm text-gray-600">{treatment.performedBy}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {treatment.notes && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Catatan:</p>
                                <p className="text-sm text-gray-600">{treatment.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
