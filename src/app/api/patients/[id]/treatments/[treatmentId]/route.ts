import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; treatmentId: string }> }
) {
  try {
    const { id, treatmentId } = await params;
    const body = await request.json();
    
    const {
      type,
      description,
      date,
      teeth,
      notes,
      cost,
    } = body;

    // Validate required fields
    if (!type || !description || !date) {
      return NextResponse.json(
        { error: 'Jenis perawatan, deskripsi, dan tanggal wajib diisi' },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Pasien tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate treatment exists and belongs to patient
    const existingTreatment = await prisma.treatment.findFirst({
      where: {
        id: treatmentId,
        patientId: id,
      },
    });

    if (!existingTreatment) {
      return NextResponse.json(
        { error: 'Perawatan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update treatment
    const treatment = await prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        type,
        description,
        date: new Date(date),
        teeth: teeth ? teeth : undefined,
        notes: notes || null,
        cost: cost || null,
      },
    });

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Error updating treatment:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate perawatan' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; treatmentId: string }> }
) {
  try {
    const { id, treatmentId } = await params;

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Pasien tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get treatment
    const treatment = await prisma.treatment.findFirst({
      where: {
        id: treatmentId,
        patientId: id,
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { error: 'Perawatan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data perawatan' },
      { status: 500 }
    );
  }
}
