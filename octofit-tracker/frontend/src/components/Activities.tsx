import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const types: Record<string, string> = { run: 'Corrida', walk: 'Caminhada', cycle: 'Ciclismo', strength: 'Musculação' };
  return <CapabilityCard<Activity> title="Atividades" path="/api/activities" dataKey="activities" emptyText="Nenhuma atividade encontrada." renderItem={(activity) => <>{types[activity.type] ?? activity.type}: {activity.minutes} minutos, {activity.points} pontos</>} />;
}
