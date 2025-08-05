import { getTreatmentById } from "./actions";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, DollarSign, FileText, User, Circle } from "lucide-react";

export default async function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; treatmentId: string }>;
}) {
  const { id, treatmentId } = await params;
  const treatment = await getTreatmentById(id, treatmentId);

  const formatTeeth = (teethData: unknown) => {
    try {
      const teeth = Array.isArray(teethData) ? teethData : JSON.parse(teethData as string);
      return teeth;
    } catch {
      return [];
    }
  };

  const teethList = formatTeeth(treatment.teeth);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/patients/${id}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Detail Pasien
        </Link>
      </div>

      {/* Treatment Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{treatment.description}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(treatment.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(treatment.date).toLocaleTimeString('id-ID')}
              </span>
              {treatment.type && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  {treatment.type}
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/dashboard/patients/${id}/treatments/${treatmentId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Perawatan
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Patient Info */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informasi Pasien
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nama Pasien</p>
                  <p className="font-medium text-gray-800">{treatment.patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Kelamin</p>
                  <p className="text-gray-700">{treatment.patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kontak</p>
                  <p className="text-gray-700">{treatment.patient.contact}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Treatment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Treatment Info */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Detail Perawatan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Perawatan</label>
                  <p className="mt-1 text-gray-800 font-medium">
                    {new Date(treatment.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Jam</label>
                  <p className="mt-1 text-gray-800 font-medium">
                    {new Date(treatment.date).toLocaleTimeString('id-ID')}
                  </p>
                </div>
                
                {treatment.type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Jenis Perawatan</label>
                    <p className="mt-1 text-gray-800 font-medium">{treatment.type}</p>
                  </div>
                )}
                
                {treatment.cost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Biaya Perawatan
                    </label>
                    <p className="mt-1 text-gray-800 font-medium text-lg">
                      Rp {treatment.cost.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                
                {treatment.performedBy && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Dokter yang Menangani</label>
                    <p className="mt-1 text-gray-800 font-medium">{treatment.performedBy}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500">Deskripsi Perawatan</label>
                <p className="mt-2 text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {treatment.description}
                </p>
              </div>
            </div>
          </Card>

          {/* Teeth Involved */}
          {teethList.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Circle className="w-5 h-5 mr-2" />
                  Gigi yang Dirawat
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({length: 32}, (_, i) => i + 1).map((toothNumber) => {
                    const isInvolved = teethList.includes(toothNumber);
                    return (
                      <div
                        key={toothNumber}
                        className={`
                          w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium
                          ${isInvolved 
                            ? 'bg-red-100 border-red-300 text-red-800' 
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                          }
                        `}
                      >
                        {toothNumber}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Gigi yang dirawat: <span className="font-medium">{teethList.join(', ')}</span>
                </p>
              </div>
            </Card>
          )}

          {/* Notes */}
          {treatment.notes && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Catatan Tambahan</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{treatment.notes}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
