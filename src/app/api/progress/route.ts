import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

const DEFAULT_PROGRESS_ID = 1;

export async function GET() {
  try {
    let progress = await db.orm.public.PlayerProgress
      .where({ id: DEFAULT_PROGRESS_ID })
      .first();

    if (!progress) {
      progress = await db.orm.public.PlayerProgress.create({
        id: DEFAULT_PROGRESS_ID,
        xp: 0,
        completed: JSON.stringify([]),
        colorRewards: JSON.stringify([]),
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("GET /api/progress error:", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const xp = typeof body.xp === "number" ? body.xp : 0;
    const completed =
      typeof body.completed === "string"
        ? body.completed
        : JSON.stringify(body.completed ?? []);
    const colorRewards =
      typeof body.colorRewards === "string"
        ? body.colorRewards
        : JSON.stringify(body.colorRewards ?? []);

    const existing = await db.orm.public.PlayerProgress
      .where({ id: DEFAULT_PROGRESS_ID })
      .first();

    const saved = existing
      ? await db.orm.public.PlayerProgress
          .where({ id: DEFAULT_PROGRESS_ID })
          .update({
            xp,
            completed,
            colorRewards,
          })
      : await db.orm.public.PlayerProgress.create({
          id: DEFAULT_PROGRESS_ID,
          xp,
          completed,
          colorRewards,
        });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("POST /api/progress error:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}