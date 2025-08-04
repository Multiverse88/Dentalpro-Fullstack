'use server';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      treatments: {
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return patient;
}
