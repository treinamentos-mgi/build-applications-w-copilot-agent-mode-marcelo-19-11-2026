import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry> title="Placar" path="/api/leaderboard" dataKey="leaderboard" emptyText="Sem pontuação no placar." renderItem={(entry) => <>{entry.rank}º lugar: {entry.teamName}, {entry.totalPoints} pontos</>} />;
}
