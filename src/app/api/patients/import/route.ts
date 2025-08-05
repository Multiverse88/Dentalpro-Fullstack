import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PatientData {
  name: string;
  dateOfBirth: string;
  gender: string;
  contact: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { patients }: { patients: PatientData[] } = await request.json();

    if (!patients || !Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json(
        { error: 'No patient data provided' },
        { status: 400 }
      );
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      try {
        // Validate required fields
        if (!patient.name || !patient.dateOfBirth || !patient.gender || !patient.contact) {
          errors.push(`Pasien ${i + 1}: Data tidak lengkap`);
          failed++;
          continue;
        }

        // Check if patient already exists (by name and dateOfBirth)
        const existingPatient = await prisma.patient.findFirst({
          where: {
            name: patient.name,
            dateOfBirth: new Date(patient.dateOfBirth)
          }
        });

        if (existingPatient) {
          errors.push(`Pasien ${patient.name}: Sudah ada dalam database`);
          failed++;
          continue;
        }

        // Create new patient
        await prisma.patient.create({
          data: {
            name: patient.name,
            dateOfBirth: new Date(patient.dateOfBirth),
            gender: patient.gender,
            contact: patient.contact,
            address: patient.address || null
          }
        });

        imported++;
      } catch (error) {
        console.error(`Error importing patient ${i + 1}:`, error);
        errors.push(`Pasien ${patient.name}: Error database`);
        failed++;
      }
    }

    return NextResponse.json({
      success: failed === 0,
      imported,
      failed,
      errors,
      message: `${imported} pasien berhasil diimport, ${failed} gagal`
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
