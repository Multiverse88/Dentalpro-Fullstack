import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Card } from "@/components/ui/Card";

async function getStats() {
  const [patientsCount, treatmentsCount, todayAppointments] = await Promise.all([
    prisma.patient.count(),
    prisma.treatment.count(),
    prisma.treatment.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return {
    patientsCount,
    treatmentsCount,
    todayAppointments,
  };
}

async function getRecentPatients() {
  return prisma.patient.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      treatments: {
        take: 1,
        orderBy: {
          date: 'desc',
        },
      },
    },
  });
}

export default async function DashboardPage() {
  const { patientsCount, treatmentsCount, todayAppointments } = await getStats();
  const recentPatients = await getRecentPatients();

  const stats = [
    {
      title: "Total Pasien",
      value: patientsCount,
      icon: "👤",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      href: "/dashboard/patients"
    },
    {
      title: "Total Perawatan", 
      value: treatmentsCount,
      icon: "🦷",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Janji Temu Hari Ini",
      value: todayAppointments,
      icon: "📅",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">Selamat datang di sistem manajemen dental</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const CardContent = (
            <Card key={index} variant="default" className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-10`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.title}</p>
                </div>
              </div>
            </Card>
          );

          // Jika ada href, bungkus dengan Link
          if (stat.href) {
            return (
              <Link key={index} href={stat.href}>
                {CardContent}
              </Link>
            );
          }

          // Jika tidak ada href, tampilkan card biasa
          return CardContent;
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="default">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">👥</span>
              Pasien Terbaru
            </h3>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/dashboard/patients/${patient.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-300">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                          {new Date(patient.dateOfBirth).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                        {patient.treatments[0]
                          ? `Terakhir: ${new Date(patient.treatments[0].date).toLocaleDateString('id-ID')}`
                          : 'Belum ada perawatan'}
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors mt-1">
                        Klik untuk detail →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Statistik Cepat
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pasien Minggu Ini</span>
                  <span className="text-gray-800 font-bold">+12</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perawatan Selesai</span>
                  <span className="text-gray-800 font-bold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
