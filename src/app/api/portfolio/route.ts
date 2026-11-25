import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET() {
  try {
    const items = await db.orm.public.PortfolioItem.all();
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to load portfolio items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "General";

    const imageData =
      typeof body.imageData === "string" && body.imageData.trim()
        ? body.imageData.trim()
        : null;

    const created = await db.orm.public.PortfolioItem.create({
      title,
      category,
      imageData,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}