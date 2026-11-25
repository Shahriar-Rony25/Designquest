import { NextResponse } from "next/server";
import { db } from "../../../prisma/db";

const DEFAULT_PROGRESS = {
  id: 1,
  xp: 120,
  completed: "[]",
  colorRewards: "[false,false,false]",
};

export async function GET() {
  try {
    let progress = await db.orm.public.PlayerProgress.findUnique({
      where: { id: 1 },
    });

    if (!progress) {
      progress = await db.orm.public.PlayerProgress.create({
        data: DEFAULT_PROGRESS,
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("GET /api/progress failed:", error);
    return NextResponse.json(
      { error: "Failed to load player progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data: {
      xp?: number;
      completed?: string;
      colorRewards?: string;
    } = {};

    if (typeof body.xp === "number") {
      data.xp = body.xp;
    }

    if (typeof body.completed === "string") {
      data.completed = body.completed;
    } else if (Array.isArray(body.completed)) {
      data.completed = JSON.stringify(body.completed);
    }

    if (typeof body.colorRewards === "string") {
      data.colorRewards = body.colorRewards;
    } else if (Array.isArray(body.colorRewards)) {
      data.colorRewards = JSON.stringify(body.colorRewards);
    }

    const existing = await db.orm.public.PlayerProgress.findUnique({
      where: { id: 1 },
    });

    const saved = existing
      ? await db.orm.public.PlayerProgress.update({
          where: { id: 1 },
          data,
        })
      : await db.orm.public.PlayerProgress.create({
          data: { ...DEFAULT_PROGRESS, ...data },
        });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("POST /api/progress failed:", error);
    return NextResponse.json(
      { error: "Failed to save player progress" },
      { status: 500 }
    );
  }
}