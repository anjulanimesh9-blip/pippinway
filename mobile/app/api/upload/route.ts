import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file: any = data.get("file");

    if (!file) {
      return NextResponse.json({
        success: false,
      });
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const filePath = path.join(
      process.cwd(),
      "public/uploads",
      file.name
    );

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: `/uploads/${file.name}`,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      success: false,
    });
  }
}