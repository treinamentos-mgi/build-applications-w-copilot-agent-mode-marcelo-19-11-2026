import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };
const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams').then((data) => data.teams);

export default function Teams() {
  return <CapabilityCard<Team> title="Equipes" loadItems={loadTeams} emptyText="Nenhuma equipe encontrada." renderItem={(team) => <>{team.name}: {team.members.length} integrantes</>} />;
}
