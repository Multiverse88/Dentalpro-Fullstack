'use server';

import { prisma } from "@/lib/prisma";

export async function searchPatients(query: string) {
  return prisma.patient.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          contact: {
            contains: query,
          },
        },
      ],
    },
    include: {
      treatments: {
        take: 1,
        orderBy: {
          date: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
