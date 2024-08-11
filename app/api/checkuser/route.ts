import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkUser } from "@/assets/utility/checkUser";
import { updateUserRole } from "@/assets/utility/updateUserRole";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await checkUser();
  await updateUserRole(userId, "admin");
  return NextResponse.json({ user, userId });
}
