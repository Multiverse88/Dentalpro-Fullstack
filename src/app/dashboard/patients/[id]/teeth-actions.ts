'use server';

import { prisma } from "@/lib/prisma";

export async function getPatientTeethConditions(patientId: string) {
  try {
    console.log(`[${new Date().toISOString()}] Fetching teeth conditions for patient ${patientId}`);
    
    // Get all treatments for the patient
    const treatments = await prisma.treatment.findMany({
      where: {
        patientId: patientId
      },
      select: {
        teeth: true,
        type: true,
        description: true,
        date: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Patient ${patientId} - Found ${treatments.length} treatments`);

    // Process teeth data to determine current conditions
    const teethConditions = new Map();

    treatments.forEach(treatment => {
      // Skip if no teeth data
      if (!treatment.teeth) return;
      
      console.log('Processing treatment:', treatment.type, 'with teeth:', treatment.teeth);
      
      try {
        let teeth = [];
        if (typeof treatment.teeth === 'string') {
          teeth = JSON.parse(treatment.teeth);
        } else if (Array.isArray(treatment.teeth)) {
          teeth = treatment.teeth;
        }

        console.log('Parsed teeth:', teeth);

        teeth.forEach((toothNumber: number | string) => {
          // Convert to number if it's a string
          const toothNum = typeof toothNumber === 'string' ? parseInt(toothNumber, 10) : toothNumber;
          
          // Only set condition if tooth hasn't been processed yet (latest treatment wins)
          if (!teethConditions.has(toothNum)) {
            let condition = 'healthy';
            
            // Determine condition based on treatment type
            const treatmentType = treatment.type?.toLowerCase() || '';
            const description = treatment.description?.toLowerCase() || '';

            if (treatmentType.includes('pencabutan') || description.includes('cabut') || description.includes('pencabutan')) {
              condition = 'extracted';
            } else if (treatmentType.includes('saluran akar') || treatmentType.includes('endodontik') || description.includes('saluran akar')) {
              condition = 'root_canal';
            } else if (treatmentType.includes('mahkota') || treatmentType.includes('crown') || description.includes('crown') || description.includes('mahkota')) {
              condition = 'crown';
            } else if (treatmentType.includes('tambal') || treatmentType.includes('penambalan') || treatmentType.includes('tambalan') || description.includes('tambal')) {
              condition = 'filled';
            } else if (treatmentType.includes('karies') || description.includes('karies') || description.includes('berlubang')) {
              condition = 'decayed';
            } else {
              // For other treatments like scaling, behel, etc. - mark as healthy since they don't change tooth condition
              condition = 'healthy';
            }

            teethConditions.set(toothNum, {
              number: toothNum,
              condition,
              notes: treatment.description,
              lastTreatment: treatment.date
            });
          }
        });
      } catch (error) {
        console.error('Error parsing teeth data:', error);
      }
    });

    const result = Array.from(teethConditions.values());
    console.log(`[${new Date().toISOString()}] Processed ${result.length} teeth conditions for patient ${patientId}`);
    console.log('Teeth conditions:', result.map(t => `${t.number}:${t.condition}`).join(', '));
    
    return result;
  } catch (error) {
    console.error('Error fetching teeth conditions:', error);
    return [];
  }
}
