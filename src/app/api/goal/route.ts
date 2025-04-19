import { getDB } from "../config/firebase";

import { CreateGoalRequest, CreateGoalResponse, GoalQuiz } from "./types";

export async function POST(request: Request) {
  const data = (await request.json()) as CreateGoalRequest;
  const db = getDB();

  const docRef = db.collection(`goals`).doc();

  const dateToDB: GoalQuiz = {
    languageToLearn: data.languageToLearn,
    level: data.level,
    description: data.description,
    isCreated: false,
    id: docRef.id,
  };

  await docRef.set(dateToDB);

  const response: CreateGoalResponse = {
    id: docRef.id,
  };

  return Response.json(response);
}

export async function GET(request: Request) {
  const db = getDB();

  const queryParams = new URL(request.url).searchParams;
  const id = queryParams.get("id");
  if (!id) {
    return Response.json(null, { status: 400 });
  }

  const snapshot = await db.collection(`goals`).doc(id).get();

  const goal: GoalQuiz | null = snapshot.data() as GoalQuiz | null;

  if (!goal) {
    return Response.json(null, { status: 404 });
  }
  return Response.json(goal);
}

export async function DELETE(request: Request) {
  const db = getDB();

  const queryParams = new URL(request.url).searchParams;
  const id = queryParams.get("id");
  if (!id) {
    return Response.json(null, { status: 400 });
  }

  // soft delete. Mark as created
  const snapshot = await db.collection(`goals`).doc(id).get();
  const goal: GoalQuiz | null = snapshot.data() as GoalQuiz | null;
  if (!goal) {
    return Response.json(null, { status: 404 });
  }
  await db.collection(`goals`).doc(id).update({
    isCreated: true,
  });

  return Response.json(null);
}
