import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const SCORES_KEY = 'fruitninja:scores';
const LEADERBOARD_KEY = 'fruitninja:leaderboard';

export async function getUserScore(fid: number): Promise<number> {
  const score = await redis.hget<number>(SCORES_KEY, String(fid));
  return score || 0;
}

export async function submitScore(
  fid: number,
  score: number,
  displayName?: string
): Promise<boolean> {
  const current = await getUserScore(fid);
  if (score <= current) return false;

  await redis.hset(SCORES_KEY, { [String(fid)]: score });

  // Update leaderboard (sorted set, score as rank)
  await redis.zadd(LEADERBOARD_KEY, {
    score,
    member: JSON.stringify({ fid, displayName: displayName || `user:${fid}` }),
  });

  return true;
}

export interface LeaderboardEntry {
  fid: number;
  displayName: string;
  score: number;
}

// Wallet-based scores
const WALLET_SCORES_KEY = 'fruitninja:wallet_scores';

export async function getUserScoreByAddress(address: string): Promise<number> {
  const score = await redis.hget<number>(WALLET_SCORES_KEY, address.toLowerCase());
  return score || 0;
}

export async function submitScoreByAddress(
  address: string,
  score: number
): Promise<boolean> {
  const addr = address.toLowerCase();
  const current = await getUserScoreByAddress(addr);
  if (score <= current) return false;

  await redis.hset(WALLET_SCORES_KEY, { [addr]: score });

  const short = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  await redis.zadd(LEADERBOARD_KEY, {
    score,
    member: JSON.stringify({ address: addr, displayName: short }),
  });

  return true;
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const results = await redis.zrange<string[]>(LEADERBOARD_KEY, 0, limit - 1, { rev: true, withScores: true });

  if (!results || results.length === 0) return [];

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < results.length; i += 2) {
    try {
      const raw = results[i];
      const member = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const score = Number(results[i + 1]);
      entries.push({ fid: member.fid, displayName: member.displayName, score });
    } catch {
      continue;
    }
  }

  return entries;
}
