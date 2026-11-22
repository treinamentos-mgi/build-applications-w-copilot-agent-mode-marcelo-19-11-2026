import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then((data) => data.activities);

export default function Activities() {
  const types: Record<string, string> = { run: 'Corrida', walk: 'Caminhada', cycle: 'Ciclismo', strength: 'Musculação' };
  return <CapabilityCard<Activity> title="Atividades" loadItems={loadActivities} emptyText="Nenhuma atividade encontrada." renderItem={(activity) => <>{types[activity.type] ?? activity.type}: {activity.minutes} minutos, {activity.points} pontos</>} />;
}
