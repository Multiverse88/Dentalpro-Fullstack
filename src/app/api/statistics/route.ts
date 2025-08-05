import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get statistics
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    const [totalPatients, totalTreatments, recentTreatments] = await Promise.all([
      // Total patients
      prisma.patient.count(),
      
      // Total treatments
      prisma.treatment.count(),
      
      // Recent treatments (this month)
      prisma.treatment.count({
        where: {
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          }
        }
      })
    ]);

    // Get database info
    const databaseProvider = process.env.DATABASE_URL?.includes('neon') ? 'Neon PostgreSQL' : 
                            process.env.DATABASE_URL?.includes('postgres') ? 'PostgreSQL' :
                            process.env.DATABASE_URL?.includes('mysql') ? 'MySQL' : 'Database';

    return NextResponse.json({
      statistics: {
        totalPatients,
        totalTreatments,
        recentTreatments,
        database: {
          provider: databaseProvider,
          status: 'Connected'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Statistics API error:", error);
    return NextResponse.json(
      { error: "Failed to get statistics" },
      { status: 500 }
    );
  }
}
