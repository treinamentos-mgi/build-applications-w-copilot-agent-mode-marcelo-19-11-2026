import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
const loadLeaderboard = () => getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then((data) => data.leaderboard);

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry> title="Placar" loadItems={loadLeaderboard} emptyText="Sem pontuação no placar." renderItem={(entry) => <>{entry.rank}º lugar: {entry.teamName}, {entry.totalPoints} pontos</>} />;
}
