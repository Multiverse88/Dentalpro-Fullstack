'use server';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getTreatmentById(patientId: string, treatmentId: string) {
  const treatment = await prisma.treatment.findFirst({
    where: { 
      id: treatmentId,
      patientId: patientId
    },
    include: {
      patient: true,
    },
  });

  if (!treatment) {
    notFound();
  }

  return treatment;
}
