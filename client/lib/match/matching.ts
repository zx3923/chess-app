import { MAX_RANGE, POLLING_INTERVAL } from "../constants";
import db from "../db";

export async function addToQueue(
  userId: number,
  gamemode: string,
  rating: number
) {
  await db.matchQueue.create({
    data: {
      userId,
      mode: gamemode,
      rating,
      is_active: true,
      timestamp: new Date(),
    },
  });
}

export const findMatch = async (
  userId: number,
  userRating: number,
  mode: string
) => {
  let range = 100;

  while (true) {
    const isActive = await db.matchQueue.findUnique({
      where: { userId },
      select: { is_active: true },
    });

    if (!isActive || !isActive.is_active) {
      console.log("사용자가 매칭을 취소했습니다.");
      return null;
    }

    const opponent = await db.matchQueue.findFirst({
      where: {
        mode,
        rating: {
          gte: userRating - range,
          lte: userRating + range,
        },
        is_active: true,
        userId: { not: userId },
      },
      orderBy: { timestamp: "asc" },
    });

    if (opponent) {
      console.log("적합한 상대를 찾았습니다:", opponent);
      return opponent;
    }

    if (range < MAX_RANGE) {
      range += 50;
    }

    console.log("적합한 상대를 찾지 못했습니다. 다시 시도합니다...");
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
};

export const cancelMatchRequest = async (userId: number) => {
  await db.matchQueue.update({
    where: { userId },
    data: { is_active: false },
  });
  console.log("매칭 요청이 취소되었습니다.");
};

export const createGame = async (player1: any, player2: any, mode: string) => {
  await db.matchQueue.deleteMany({
    where: {
      userId: {
        in: [player1.userId, player2.userId],
      },
    },
  });

  return await db.game.create({
    data: {
      player1Id: player1.userId,
      player2Id: player2.userId,
      mode,
    },
  });
};
