import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Disabled. Listing images upload to Firebase Storage with auth + rules.
 * This route previously wrote arbitrary files to public/uploads with no auth.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Upload endpoint disabled" },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Upload endpoint disabled" },
    { status: 405 }
  );
}
