'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { MonthlyTreatmentsList } from '@/components/calendar/MonthlyTreatmentsList';
import { getTreatmentsByMonth } from './actions';
import { Card } from '@/components/ui/Card';
import { Calendar, TrendingUp, Grid, List } from 'lucide-react';

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

export default function CalendarPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const loadTreatments = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await getTreatmentsByMonth(year, month);
      setTreatments(data);
    } catch (error) {
      console.error('Error loading treatments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDateChange = useCallback((year: number, month: number) => {
    console.log('Loading data for:', year, month);
    setCurrentYear(year);
    setCurrentMonth(month);
    loadTreatments(year, month);
  }, [loadTreatments]);

  // Calculate statistics
  const getMonthlyStats = () => {
    const totalTreatments = treatments.length;
    const uniquePatients = new Set(treatments.map(t => t.patient.id)).size;
    const totalRevenue = treatments.reduce((sum, t) => sum + (t.cost || 0), 0);
    
    // Group by treatment type
    const treatmentTypes = treatments.reduce((acc, treatment) => {
      const type = treatment.type || 'Lainnya';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTreatments,
      uniquePatients,
      totalRevenue,
      treatmentTypes
    };
  };

  const stats = getMonthlyStats();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    loadTreatments(currentYear, currentMonth);
  }, []); // Only run on initial mount

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Kalender Perawatan
          </h2>
          <p className="text-gray-600">
            Jadwal dan riwayat perawatan untuk {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Kalender</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Perawatan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTreatments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats.totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Treatment Types Distribution */}
      {Object.keys(stats.treatmentTypes).length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Distribusi Jenis Perawatan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.treatmentTypes).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-sm text-gray-600">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          treatments={treatments} 
          onDateChange={handleDateChange}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      ) : (
        <MonthlyTreatmentsList 
          treatments={treatments}
          title={`Perawatan ${monthNames[currentMonth]} ${currentYear}`}
        />
      )}
    </div>
  );
}
