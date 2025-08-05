'use client';

import { useState, useEffect } from 'react';

interface ToothCondition {
  number: number;
  condition: 'healthy' | 'filled' | 'decayed' | 'extracted' | 'crown' | 'root_canal';
  notes?: string;
  lastTreatment?: Date;
}

interface OdontogramProps {
  teeth?: ToothCondition[];
  readOnly?: boolean;
  onToothClick?: (tooth: number) => void;
  selectedTeeth?: number[];
  onSelectionChange?: (selectedTeeth: number[]) => void;
}

export function Odontogram({ 
  teeth = [], 
  readOnly = true, 
  onToothClick, 
  selectedTeeth: externalSelectedTeeth,
  onSelectionChange 
}: OdontogramProps) {
  const [internalSelectedTeeth, setInternalSelectedTeeth] = useState<number[]>([]);
  
  // Use external selection if provided, otherwise use internal state
  const selectedTeeth = externalSelectedTeeth || internalSelectedTeeth;
  const setSelectedTeeth = onSelectionChange || setInternalSelectedTeeth;

  // Update when teeth data changes to force re-render
  useEffect(() => {
    console.log('Odontogram updated with new teeth data:', teeth.length, 'conditions');
  }, [teeth]);

  // Standard FDI notation for permanent teeth
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getToothCondition = (toothNumber: number): ToothCondition | undefined => {
    return teeth.find(t => t.number === toothNumber);
  };

  const getToothColor = (condition?: string) => {
    switch (condition) {
      case 'healthy':
        return 'fill-white stroke-gray-400';
      case 'filled':
        return 'fill-blue-200 stroke-blue-400';
      case 'decayed':
        return 'fill-red-200 stroke-red-400';
      case 'extracted':
        return 'fill-gray-300 stroke-gray-500';
      case 'crown':
        return 'fill-yellow-200 stroke-yellow-400';
      case 'root_canal':
        return 'fill-purple-200 stroke-purple-400';
      default:
        return 'fill-white stroke-gray-300';
    }
  };

  const handleToothClick = (toothNumber: number) => {
    if (!readOnly) {
      // Toggle tooth selection for multiple selection
      const isSelected = selectedTeeth.includes(toothNumber);
      let newSelection: number[];
      
      if (isSelected) {
        // Remove from selection
        newSelection = selectedTeeth.filter(tooth => tooth !== toothNumber);
      } else {
        // Add to selection
        newSelection = [...selectedTeeth, toothNumber];
      }
      
      // Update selection
      setSelectedTeeth(newSelection);
      
      // Call the callback with the clicked tooth
      onToothClick?.(toothNumber);
    }
  };

  // Function to get tooth type based on FDI number
  const getToothType = (number: number): 'incisor' | 'canine' | 'premolar' | 'molar' => {
    const lastDigit = number % 10;
    if (lastDigit === 1 || lastDigit === 2) return 'incisor';
    if (lastDigit === 3) return 'canine';
    if (lastDigit === 4 || lastDigit === 5) return 'premolar';
    return 'molar';
  };

  // Function to check if tooth is upper or lower
  const isUpperTooth = (number: number): boolean => {
    return number >= 11 && number <= 28;
  };

  const ToothSVG = ({ number, condition, isSelected }: { 
    number: number; 
    condition?: ToothCondition; 
    isSelected: boolean;
  }) => {
    const toothType = getToothType(number);
    const isUpper = isUpperTooth(number);
    
    // SVG paths for different tooth types
    const getToothPath = () => {
      switch (toothType) {
        case 'incisor':
          return isUpper 
            ? "M16 2 C18 2, 22 4, 22 8 C22 12, 20 20, 18 28 C17 32, 16 36, 16 38 C16 36, 15 32, 14 28 C12 20, 10 12, 10 8 C10 4, 14 2, 16 2 Z"
            : "M16 38 C18 38, 22 36, 22 32 C22 28, 20 20, 18 12 C17 8, 16 4, 16 2 C16 4, 15 8, 14 12 C12 20, 10 28, 10 32 C10 36, 14 38, 16 38 Z";
        
        case 'canine':
          return isUpper
            ? "M16 2 C19 2, 24 5, 24 10 C24 15, 22 22, 20 28 C18 32, 16 36, 16 38 C16 36, 14 32, 12 28 C10 22, 8 15, 8 10 C8 5, 13 2, 16 2 Z"
            : "M16 38 C19 38, 24 35, 24 30 C24 25, 22 18, 20 12 C18 8, 16 4, 16 2 C16 4, 14 8, 12 12 C10 18, 8 25, 8 30 C8 35, 13 38, 16 38 Z";
        
        case 'premolar':
          return isUpper
            ? "M16 2 C20 2, 26 6, 26 12 C26 16, 24 22, 22 28 C20 32, 18 36, 16 38 C14 36, 12 32, 10 28 C8 22, 6 16, 6 12 C6 6, 12 2, 16 2 Z"
            : "M16 38 C20 38, 26 34, 26 28 C26 24, 24 18, 22 12 C20 8, 18 4, 16 2 C14 4, 12 8, 10 12 C8 18, 6 24, 6 28 C6 34, 12 38, 16 38 Z";
        
        case 'molar':
          return isUpper
            ? "M16 2 C21 2, 28 7, 28 14 C28 18, 26 24, 24 30 C22 34, 20 37, 16 38 C12 37, 10 34, 8 30 C6 24, 4 18, 4 14 C4 7, 11 2, 16 2 Z"
            : "M16 38 C21 38, 28 33, 28 26 C28 22, 26 16, 24 10 C22 6, 20 3, 16 2 C12 3, 10 6, 8 10 C6 16, 4 22, 4 26 C4 33, 11 38, 16 38 Z";
        
        default:
          return "M16 2 C20 2, 26 6, 26 16 C26 24, 22 32, 16 38 C10 32, 6 24, 6 16 C6 6, 12 2, 16 2 Z";
      }
    };

    // Additional tooth details
    const getToothDetails = () => {
      const details = [];
      
      // Cusp details for different tooth types
      if (toothType === 'canine') {
        // Add cusp for canine
        details.push(
          <circle key="cusp" cx="16" cy={isUpper ? "8" : "32"} r="1.5" className="fill-gray-200" />
        );
      } else if (toothType === 'premolar') {
        // Add two cusps for premolar
        details.push(
          <circle key="cusp1" cx="13" cy={isUpper ? "10" : "30"} r="1" className="fill-gray-200" />,
          <circle key="cusp2" cx="19" cy={isUpper ? "10" : "30"} r="1" className="fill-gray-200" />
        );
      } else if (toothType === 'molar') {
        // Add four cusps for molar
        details.push(
          <circle key="cusp1" cx="12" cy={isUpper ? "12" : "28"} r="1" className="fill-gray-200" />,
          <circle key="cusp2" cx="20" cy={isUpper ? "12" : "28"} r="1" className="fill-gray-200" />,
          <circle key="cusp3" cx="12" cy={isUpper ? "18" : "22"} r="1" className="fill-gray-200" />,
          <circle key="cusp4" cx="20" cy={isUpper ? "18" : "22"} r="1" className="fill-gray-200" />
        );
      }
      
      return details;
    };

    return (
      <div className="relative group">
        <svg
          width="36"
          height="44"
          viewBox="0 0 32 40"
          className={`cursor-pointer transition-all duration-200 ${
            isSelected ? 'scale-110' : 'hover:scale-105'
          }`}
          onClick={() => handleToothClick(number)}
        >
          {/* Tooth main shape */}
          <path
            d={getToothPath()}
            className={`${getToothColor(condition?.condition)} stroke-2 transition-colors duration-200 ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
          />
          
          {/* Tooth anatomical details */}
          {getToothDetails()}
          
          {/* Root outline for realistic appearance */}
          {toothType === 'molar' && (
            <g className="stroke-gray-300 fill-none stroke-1">
              <path d={isUpper ? "M12 38 L12 42 M20 38 L20 42" : "M12 2 L12 -2 M20 2 L20 -2"} />
            </g>
          )}
          {toothType === 'premolar' && (
            <g className="stroke-gray-300 fill-none stroke-1">
              <path d={isUpper ? "M16 38 L16 42" : "M16 2 L16 -2"} />
            </g>
          )}
          
          {/* Tooth number */}
          <text
            x="16"
            y="20"
            textAnchor="middle"
            className="text-[10px] font-bold fill-gray-700 pointer-events-none"
          >
            {number}
          </text>

          {/* Special markings for conditions */}
          {condition?.condition === 'extracted' && (
            <g>
              <line x1="8" y1="8" x2="24" y2="32" stroke="#ef4444" strokeWidth="3" />
              <line x1="24" y1="8" x2="8" y2="32" stroke="#ef4444" strokeWidth="3" />
            </g>
          )}
          
          {condition?.condition === 'root_canal' && (
            <circle cx="16" cy="20" r="4" fill="#8b5cf6" opacity="0.7" />
          )}

          {condition?.condition === 'filled' && (
            <circle cx="16" cy="16" r="3" fill="#3b82f6" opacity="0.8" />
          )}

          {condition?.condition === 'decayed' && (
            <g>
              <circle cx="14" cy="15" r="2" fill="#ef4444" opacity="0.8" />
              <circle cx="18" cy="18" r="1.5" fill="#dc2626" opacity="0.6" />
            </g>
          )}

          {condition?.condition === 'crown' && (
            <rect x="10" y="8" width="12" height="8" rx="2" fill="#eab308" opacity="0.8" />
          )}
        </svg>

        {/* Tooltip - Always show tooltip for all teeth */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg pointer-events-none">
          <div className="font-semibold">
            {condition ? getConditionLabel(condition.condition) : 'Sehat'}
          </div>
          <div className="text-gray-300 text-[10px]">
            Gigi {number} - {getToothTypeLabel(toothType)}
          </div>
          <div className="text-blue-300 text-[10px]">
            {getToothPosition(number)}
          </div>
          {condition?.lastTreatment && (
            <div className="text-gray-400 text-[10px] mt-1">
              Terakhir: {new Date(condition.lastTreatment).toLocaleDateString('id-ID')}
            </div>
          )}
          {condition?.notes && (
            <div className="text-gray-300 mt-1 max-w-48 break-words">
              {condition.notes}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  const getToothPosition = (number: number): string => {
    const tens = Math.floor(number / 10);
    
    let quadrant = '';
    switch (tens) {
      case 1: quadrant = 'Kanan Atas'; break;
      case 2: quadrant = 'Kiri Atas'; break;
      case 3: quadrant = 'Kiri Bawah'; break;
      case 4: quadrant = 'Kanan Bawah'; break;
      default: quadrant = 'Unknown'; break;
    }
    
    return `${quadrant}`;
  };

  const getToothTypeLabel = (type: string) => {
    switch (type) {
      case 'incisor': return 'Seri';
      case 'canine': return 'Taring';
      case 'premolar': return 'Geraham Kecil';
      case 'molar': return 'Geraham Besar';
      default: return '';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'healthy': return 'Sehat';
      case 'filled': return 'Tambalan';
      case 'decayed': return 'Karies';
      case 'extracted': return 'Dicabut';
      case 'crown': return 'Mahkota';
      case 'root_canal': return 'Saluran Akar';
      default: return 'Normal';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Odontogram - Peta Gigi</h3>
        
        {/* Condition Legend */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Kondisi Gigi:</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
              <span>Sehat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
              <span>Tambalan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
              <span>Karies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
              <span>Mahkota</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-purple-200 border-2 border-purple-400 rounded"></div>
              <span>Saluran Akar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 border-2 border-gray-500 rounded"></div>
              <span>Dicabut</span>
            </div>
          </div>
        </div>

        {/* Tooth Type Legend */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Jenis Gigi:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
              <span>Seri (1,2)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded-full"></div>
              <span>Taring (3)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 rounded-full"></div>
              <span>Geraham Kecil (4,5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-100 rounded-full"></div>
              <span>Geraham Besar (6,7,8)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Upper teeth */}
        <div>
          <div className="text-sm font-medium text-gray-600 mb-3 text-center">Rahang Atas</div>
          <div className="flex justify-center gap-0.5 px-4">
            {upperTeeth.map((toothNumber) => {
              const condition = getToothCondition(toothNumber);
              return (
                <ToothSVG
                  key={toothNumber}
                  number={toothNumber}
                  condition={condition}
                  isSelected={selectedTeeth.includes(toothNumber)}
                />
              );
            })}
          </div>
        </div>

        {/* Divider with bite line */}
        <div className="relative">
          <div className="border-t-2 border-gray-400"></div>
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500 font-medium">
            Gigitan
          </div>
        </div>

        {/* Lower teeth */}
        <div>
          <div className="flex justify-center gap-0.5 px-4">
            {lowerTeeth.map((toothNumber) => {
              const condition = getToothCondition(toothNumber);
              return (
                <ToothSVG
                  key={toothNumber}
                  number={toothNumber}
                  condition={condition}
                  isSelected={selectedTeeth.includes(toothNumber)}
                />
              );
            })}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-3 text-center">Rahang Bawah</div>
        </div>
      </div>

      {selectedTeeth.length > 0 && !readOnly && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800">
            {selectedTeeth.length === 1 
              ? `Gigi ${selectedTeeth[0]} dipilih`
              : `${selectedTeeth.length} gigi dipilih: ${selectedTeeth.sort((a, b) => a - b).join(', ')}`
            }
          </div>
          <button
            onClick={() => setSelectedTeeth([])}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Hapus semua pilihan
          </button>
        </div>
      )}

      {/* Statistics Summary */}
      {teeth.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ringkasan Kondisi:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {Object.entries(getTeethStatistics()).map(([condition, count]) => (
              <div key={condition} className="flex justify-between">
                <span className="text-gray-600">{getConditionLabel(condition)}:</span>
                <span className="font-medium">{count} gigi</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to calculate teeth statistics
  function getTeethStatistics() {
    const stats: Record<string, number> = {};
    teeth.forEach(tooth => {
      stats[tooth.condition] = (stats[tooth.condition] || 0) + 1;
    });
    return stats;
  }
}
