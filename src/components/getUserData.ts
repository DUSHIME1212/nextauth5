import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function getUserData() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
      posts: true,
    },
  });

  return user;
}