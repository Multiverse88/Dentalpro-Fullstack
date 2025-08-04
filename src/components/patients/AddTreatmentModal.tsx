'use client';

import { useState, useEffect } from 'react';
import { X, Stethoscope, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Treatment {
  id: string;
  date: Date;
  type: string | null;
  description: string;
  teeth: any;
  notes: string | null;
  cost: number | null;
}

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTreatmentAdded: () => void;
  patientId: string;
  patientName: string;
  editTreatment?: Treatment | null;
  selectedTeeth?: number[];
}

interface TreatmentFormData {
  type: string;
  description: string;
  date: string;
  teeth: string[];
  notes: string;
  cost: string;
}

export function AddTreatmentModal({ 
  isOpen, 
  onClose, 
  onTreatmentAdded, 
  patientId, 
  patientName,
  editTreatment = null,
  selectedTeeth = []
}: AddTreatmentModalProps) {
  const [formData, setFormData] = useState<TreatmentFormData>({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    teeth: [],
    notes: '',
    cost: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<TreatmentFormData>>({});
  const { showToast } = useToast();

  const isEditMode = editTreatment !== null;

  // Initialize form with edit data
  useEffect(() => {
    if (editTreatment) {
      const teethArray = editTreatment.teeth ? 
        (Array.isArray(editTreatment.teeth) ? editTreatment.teeth : JSON.parse(editTreatment.teeth)) : 
        [];
      
      setFormData({
        type: editTreatment.type || '',
        description: editTreatment.description || '',
        date: new Date(editTreatment.date).toISOString().split('T')[0],
        teeth: teethArray,
        notes: editTreatment.notes || '',
        cost: editTreatment.cost ? editTreatment.cost.toString() : '',
      });
    } else {
      // For new treatment, use selected teeth from odontogram
      setFormData({
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        teeth: selectedTeeth.map(tooth => tooth.toString()), // Convert numbers to strings
        notes: '',
        cost: '',
      });
    }
  }, [editTreatment, selectedTeeth]);

  // Common treatment types
  const treatmentTypes = [
    'Pemeriksaan Rutin',
    'Pembersihan',
    'Penambalan',
    'Pencabutan',
    'Perawatan Saluran Akar',
    'Crown/Bridge',
    'Orthodonti',
    'Scaling',
    'Bleaching',
    'Bedah Mulut',
    'Lainnya'
  ];

  // Dental notation (teeth numbering)
  const upperTeeth = Array.from({ length: 16 }, (_, i) => (i + 11).toString());
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => (i + 31).toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof TreatmentFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTeethSelection = (tooth: string) => {
    setFormData(prev => ({
      ...prev,
      teeth: prev.teeth.includes(tooth)
        ? prev.teeth.filter(t => t !== tooth)
        : [...prev.teeth, tooth]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TreatmentFormData> = {};

    if (!formData.type.trim()) {
      newErrors.type = 'Jenis perawatan wajib diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi perawatan wajib diisi';
    }

    if (!formData.date) {
      newErrors.date = 'Tanggal perawatan wajib diisi';
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = 'Biaya harus berupa angka';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const url = isEditMode 
        ? `/api/patients/${patientId}/treatments/${editTreatment!.id}`
        : `/api/patients/${patientId}/treatments`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          teeth: formData.teeth.length > 0 ? formData.teeth : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} perawatan`);
      }

      // Show success toast
      showToast({
        type: 'success',
        title: `Perawatan berhasil ${isEditMode ? 'diupdate' : 'ditambahkan'}`,
        message: `Perawatan ${formData.type} untuk ${patientName} telah ${isEditMode ? 'diperbarui' : 'disimpan'}`,
      });

      // Reset form
      setFormData({
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        teeth: [],
        notes: '',
        cost: '',
      });
      
      onTreatmentAdded();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} treatment:`, error);
      showToast({
        type: 'error',
        title: `Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} perawatan`,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan, silakan coba lagi',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        teeth: [],
        notes: '',
        cost: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm z-10"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative z-20 inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditMode ? 'Edit Perawatan' : 'Tambah Perawatan Baru'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode ? 'Edit perawatan untuk' : 'Tambah perawatan untuk'} {patientName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Treatment Type */}
              <div>
                <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Jenis Perawatan *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Pilih jenis perawatan</option>
                  {treatmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Tanggal Perawatan *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              {/* Cost */}
              <div>
                <label htmlFor="cost" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Biaya Perawatan
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.cost ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan biaya (opsional)"
                  disabled={isSubmitting}
                />
                {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Deskripsi Perawatan *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Jelaskan detail perawatan yang dilakukan"
                disabled={isSubmitting}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Teeth Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                Gigi yang Dirawat (Opsional)
              </label>
              
              {/* Show selected teeth from odontogram */}
              {selectedTeeth.length > 0 && !editTreatment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      Gigi yang dipilih dari odontogram: {selectedTeeth.sort((a, b) => a - b).join(', ')}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Anda dapat menambah atau mengurangi pilihan gigi di bawah ini.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Upper Teeth */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Gigi Atas</p>
                  <div className="grid grid-cols-8 gap-1">
                    {upperTeeth.map((tooth) => (
                      <button
                        key={tooth}
                        type="button"
                        onClick={() => handleTeethSelection(tooth)}
                        className={`p-2 text-xs font-medium rounded border transition-colors ${
                          formData.teeth.includes(tooth)
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={isSubmitting}
                      >
                        {tooth}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Lower Teeth */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Gigi Bawah</p>
                  <div className="grid grid-cols-8 gap-1">
                    {lowerTeeth.map((tooth) => (
                      <button
                        key={tooth}
                        type="button"
                        onClick={() => handleTeethSelection(tooth)}
                        className={`p-2 text-xs font-medium rounded border transition-colors ${
                          formData.teeth.includes(tooth)
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={isSubmitting}
                      >
                        {tooth}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {formData.teeth.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Gigi terpilih: {formData.teeth.join(', ')}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Catatan Tambahan
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Catatan khusus atau instruksi follow-up"
                disabled={isSubmitting}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting 
                  ? (isEditMode ? 'Mengupdate...' : 'Menyimpan...') 
                  : (isEditMode ? 'Update Perawatan' : 'Simpan Perawatan')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
