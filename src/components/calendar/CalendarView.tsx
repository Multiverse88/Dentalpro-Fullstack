'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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

interface CalendarViewProps {
  treatments: Treatment[];
  onDateChange: (year: number, month: number) => void;
  currentYear?: number;
  currentMonth?: number;
}

export function CalendarView({ treatments, onDateChange, currentYear, currentMonth }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const lastSyncRef = useRef<{year: number, month: number} | null>(null);

  // Sync currentDate with props from parent
  useEffect(() => {
    if (currentYear !== undefined && currentMonth !== undefined) {
      // Check if we've already synced these values to prevent infinite loops
      if (!lastSyncRef.current || 
          lastSyncRef.current.year !== currentYear || 
          lastSyncRef.current.month !== currentMonth) {
        const newDate = new Date(currentYear, currentMonth, 1);
        setCurrentDate(newDate);
        lastSyncRef.current = { year: currentYear, month: currentMonth };
      }
    }
  }, [currentYear, currentMonth]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Group treatments by date
  const treatmentsByDate = treatments.reduce((acc, treatment) => {
    // Ensure the date is a Date object
    const treatmentDate = treatment.date instanceof Date ? treatment.date : new Date(treatment.date);
    const dateKey = treatmentDate.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push({
      ...treatment,
      date: treatmentDate // Ensure it's a Date object
    });
    return acc;
  }, {} as Record<string, Treatment[]>);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // No need for useEffect to call onDateChange - let parent handle initial loading

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    onDateChange(newDate.getFullYear(), newDate.getMonth());
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    onDateChange(newDate.getFullYear(), newDate.getMonth());
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    onDateChange(newDate.getFullYear(), newDate.getMonth());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getSelectedDateTreatments = () => {
    if (!selectedDate) return [];
    return treatmentsByDate[selectedDate.toDateString()] || [];
  };

  const getTreatmentTypeColor = (type: string | null) => {
    const colors = {
      'Pemeriksaan': 'bg-blue-100 text-blue-800',
      'Pembersihan': 'bg-green-100 text-green-800',
      'Penambalan': 'bg-yellow-100 text-yellow-800',
      'Pencabutan': 'bg-red-100 text-red-800',
      'Perawatan Saluran Akar': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <div className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div className="flex items-center space-x-2">
                  {/* Month Selector */}
                  <select
                    value={currentDate.getMonth()}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                    className="text-xl font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  {/* Year Selector */}
                  <select
                    value={currentDate.getFullYear()}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="text-xl font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-sm font-medium text-gray-500 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2 h-20"></div>;
                }

                const dateKey = date.toDateString();
                const dayTreatments = treatmentsByDate[dateKey] || [];
                const isSelected = selectedDate?.toDateString() === dateKey;
                const isToday = new Date().toDateString() === dateKey;

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      p-2 h-20 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50
                      ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                      ${isToday ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </span>
                      {dayTreatments.length > 0 && (
                        <div className="flex-1 mt-1">
                          <div className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 inline-block">
                            {dayTreatments.length} perawatan
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div className="lg:col-span-1">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {selectedDate 
                ? `Perawatan ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Pilih Tanggal'
              }
            </h3>
            
            {selectedDate ? (
              <div className="space-y-4">
                {getSelectedDateTreatments().length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500">Tidak ada perawatan pada tanggal ini</p>
                  </div>
                ) : (
                  getSelectedDateTreatments().map((treatment) => (
                    <div
                      key={treatment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {treatment.patient.name}
                          </p>
                          <p className="text-sm text-gray-500">{treatment.patient.contact}</p>
                        </div>
                        {treatment.type && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getTreatmentTypeColor(treatment.type)}`}>
                            {treatment.type}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-600 mb-2">
                        <FileText className="w-4 h-4 mr-1 mt-0.5" />
                        <p>{treatment.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {(() => {
                            const treatmentDate = treatment.date instanceof Date ? treatment.date : new Date(treatment.date);
                            return treatmentDate.toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            });
                          })()}
                        </span>
                        {treatment.cost && (
                          <span className="font-medium text-green-600">
                            Rp {treatment.cost.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">Klik pada tanggal untuk melihat detail perawatan</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
