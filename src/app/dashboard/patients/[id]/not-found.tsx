import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Pasien Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-4">
        Maaf, data pasien yang Anda cari tidak ditemukan.
      </p>
      <Link
        href="/dashboard/patients"
        className="text-blue-600 hover:text-blue-900"
      >
        Kembali ke Daftar Pasien
      </Link>
    </div>
    );
}
