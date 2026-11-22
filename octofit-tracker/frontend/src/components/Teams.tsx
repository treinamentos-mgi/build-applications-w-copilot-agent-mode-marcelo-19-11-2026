import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<Team> title="Equipes" path="/api/teams" dataKey="teams" emptyText="Nenhuma equipe encontrada." renderItem={(team) => <>{team.name}: {team.members.length} integrantes</>} />;
}
