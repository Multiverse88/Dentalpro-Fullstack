'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Users, Clock, BarChart2, Settings, Heart } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/dashboard',
      title: 'Dashboard',
      icon: BarChart2,
      color: 'from-blue-400 to-blue-600'
    },
    {
      href: '/dashboard/patients',
      title: 'Pasien',
      icon: Users,
      color: 'from-green-400 to-green-600'
    },
    {
      href: '/dashboard/calendar',
      title: 'Kalender',
      icon: CalendarDays,
      color: 'from-purple-400 to-purple-600'
    },
    {
      href: '/dashboard/settings',
      title: 'Pengaturan',
      icon: Settings,
      color: 'from-gray-400 to-gray-600'
    }
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            DentalPro
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} mr-3 group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.title}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
