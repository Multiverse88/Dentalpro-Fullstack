'use server';

import { prisma } from "@/lib/prisma";

export async function getTreatmentsByDateRange(startDate: Date, endDate: Date) {
  return prisma.treatment.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          contact: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

export async function getTreatmentsByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const treatments = await getTreatmentsByDateRange(startDate, endDate);
  
  // Transform dates to ensure they're serialized properly
  const transformedTreatments = treatments.map(treatment => ({
    ...treatment,
    date: new Date(treatment.date), // Ensure it's a proper Date object
  }));
  
  return transformedTreatments;
}

export async function getTreatmentsByDate(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getTreatmentsByDateRange(startOfDay, endOfDay);
}
