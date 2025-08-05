import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  try {
    // Get session using getServerSession
    const session = await getServerSession(authOptions);
    
    // Get raw JWT token
    const token = await getToken({ 
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET 
    });

    return NextResponse.json({
      method: "JWT Token Debug",
      sessionExists: !!session,
      sessionData: session,
      tokenExists: !!token,
      tokenData: token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("JWT Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error },
      { status: 500 }
    );
  }
}
