import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'excel';
    const includeBasicInfo = searchParams.get('includeBasicInfo') === 'true';
    const includeTreatments = searchParams.get('includeTreatments') === 'true';
    const includeTeethConditions = searchParams.get('includeTeethConditions') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build treatment filter
    const treatmentFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) treatmentFilter.gte = new Date(dateFrom);
    if (dateTo) treatmentFilter.lte = new Date(dateTo);

    // Fetch patients with related data
    const patients = await prisma.patient.findMany({
      include: {
        treatments: includeTreatments ? {
          where: Object.keys(treatmentFilter).length > 0 ? {
            date: treatmentFilter
          } : undefined,
          orderBy: { date: 'desc' }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // CSV Export (basic info only)
      if (!includeBasicInfo) {
        return NextResponse.json(
          { error: 'CSV format requires basic info to be included' },
          { status: 400 }
        );
      }

      const csvData = patients.map(patient => ({
        'Nama': patient.name,
        'Tanggal Lahir': patient.dateOfBirth.toISOString().split('T')[0],
        'Gender': patient.gender,
        'Kontak': patient.contact,
        'Alamat': patient.address || '',
        'Tanggal Daftar': patient.createdAt.toISOString().split('T')[0],
        'Total Perawatan': includeTreatments ? patient.treatments?.length || 0 : 0
      }));

      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Patients');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=data_pasien_${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    } else {
      // Excel Export (multiple sheets)
      const wb = XLSX.utils.book_new();

      // Sheet 1: Basic Patient Info
      if (includeBasicInfo) {
        const basicData = patients.map(patient => ({
          'ID': patient.id,
          'Nama': patient.name,
          'Tanggal Lahir': patient.dateOfBirth.toISOString().split('T')[0],
          'Umur': Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
          'Gender': patient.gender,
          'Kontak': patient.contact,
          'Alamat': patient.address || '',
          'Tanggal Daftar': patient.createdAt.toISOString().split('T')[0],
          'Total Perawatan': includeTreatments ? patient.treatments?.length || 0 : 0
        }));

        const basicWs = XLSX.utils.json_to_sheet(basicData);
        XLSX.utils.book_append_sheet(wb, basicWs, 'Pasien');
      }

      // Sheet 2: Treatments
      if (includeTreatments) {
        const treatmentData: Array<{
          'ID Pasien': string;
          'Nama Pasien': string;
          'Tanggal Perawatan': string;
          'Jenis Perawatan': string;
          'Deskripsi': string;
          'Gigi': string;
          'Biaya': number;
          'Catatan': string;
        }> = [];
        patients.forEach(patient => {
          if (patient.treatments) {
            patient.treatments.forEach(treatment => {
              treatmentData.push({
                'ID Pasien': patient.id,
                'Nama Pasien': patient.name,
                'Tanggal Perawatan': treatment.date.toISOString().split('T')[0],
                'Jenis Perawatan': treatment.type || '',
                'Deskripsi': treatment.description,
                'Gigi': typeof treatment.teeth === 'string' 
                  ? JSON.parse(treatment.teeth).join(', ') 
                  : Array.isArray(treatment.teeth) 
                    ? treatment.teeth.join(', ') 
                    : '',
                'Biaya': treatment.cost || 0,
                'Catatan': treatment.notes || ''
              });
            });
          }
        });

        if (treatmentData.length > 0) {
          const treatmentWs = XLSX.utils.json_to_sheet(treatmentData);
          XLSX.utils.book_append_sheet(wb, treatmentWs, 'Perawatan');
        }
      }

      // Sheet 3: Teeth Conditions (if available)
      if (includeTeethConditions) {
        // Get teeth conditions for all patients
        const teethData: Array<{
          'ID Pasien': string;
          'Nama Pasien': string;
          'Nomor Gigi': number;
          'Kondisi': string;
          'Perawatan Terakhir': string;
          'Deskripsi': string;
        }> = [];
        
        for (const patient of patients) {
          if (patient.treatments) {
            // Process treatments to determine teeth conditions
            const teethConditions = new Map();
            
            patient.treatments.forEach(treatment => {
              if (treatment.teeth) {
                try {
                  let teeth = [];
                  if (typeof treatment.teeth === 'string') {
                    teeth = JSON.parse(treatment.teeth);
                  } else if (Array.isArray(treatment.teeth)) {
                    teeth = treatment.teeth;
                  }

                  teeth.forEach((toothNumber: number) => {
                    if (!teethConditions.has(toothNumber)) {
                      let condition = 'healthy';
                      const treatmentType = treatment.type?.toLowerCase() || '';
                      const description = treatment.description?.toLowerCase() || '';

                      if (treatmentType.includes('pencabutan') || description.includes('cabut')) {
                        condition = 'extracted';
                      } else if (treatmentType.includes('saluran akar') || description.includes('saluran akar')) {
                        condition = 'root_canal';
                      } else if (treatmentType.includes('mahkota') || description.includes('mahkota')) {
                        condition = 'crown';
                      } else if (treatmentType.includes('tambal') || description.includes('tambal')) {
                        condition = 'filled';
                      } else if (treatmentType.includes('karies') || description.includes('karies')) {
                        condition = 'decayed';
                      }

                      teethData.push({
                        'ID Pasien': patient.id,
                        'Nama Pasien': patient.name,
                        'Nomor Gigi': toothNumber,
                        'Kondisi': condition,
                        'Perawatan Terakhir': treatment.date.toISOString().split('T')[0],
                        'Deskripsi': treatment.description
                      });

                      teethConditions.set(toothNumber, condition);
                    }
                  });
                } catch (error) {
                  console.error('Error processing teeth data:', error);
                }
              }
            });
          }
        }

        if (teethData.length > 0) {
          const teethWs = XLSX.utils.json_to_sheet(teethData);
          XLSX.utils.book_append_sheet(wb, teethWs, 'Kondisi Gigi');
        }
      }

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=data_pasien_${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
