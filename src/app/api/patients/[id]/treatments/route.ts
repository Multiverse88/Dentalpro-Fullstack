import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Create treatment
    const treatment = await prisma.treatment.create({
      data: {
        patientId: id,
        type,
        description,
        date: new Date(date),
        teeth: teeth ? teeth : undefined,
        notes: notes || null,
        cost: cost || null,
      },
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error('Error creating treatment:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan perawatan' },
      { status: 500 }
    );
  }
}
