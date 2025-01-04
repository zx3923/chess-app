import db from "../db";

export default async function isExistUsername(
  user_name: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: {
      user_name: user_name,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
}
