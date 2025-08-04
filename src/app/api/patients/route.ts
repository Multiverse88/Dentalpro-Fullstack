import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dateOfBirth, gender, contact, address } = body;

    // Validate required fields
    if (!name || !dateOfBirth || !gender || !contact) {
      return NextResponse.json(
        { error: 'Data yang wajib diisi tidak lengkap' },
        { status: 400 }
      );
    }

    // Validate gender
    if (!['Male', 'Female'].includes(gender)) {
      return NextResponse.json(
        { error: 'Jenis kelamin tidak valid' },
        { status: 400 }
      );
    }

    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      return NextResponse.json(
        { error: 'Tanggal lahir tidak valid' },
        { status: 400 }
      );
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        dateOfBirth: birthDate,
        gender,
        contact: contact.trim(),
        address: address?.trim() || null,
      },
    });

    return NextResponse.json(
      { 
        message: 'Pasien berhasil ditambahkan',
        patient: {
          id: patient.id,
          name: patient.name,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          contact: patient.contact,
          address: patient.address,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan pasien' },
      { status: 500 }
    );
  }
}
