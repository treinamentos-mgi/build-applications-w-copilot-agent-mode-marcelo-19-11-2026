import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  return <CapabilityCard<Suggestion> title="Sugestões de treino" path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`} dataKey="suggestions" emptyText="Nenhuma sugestão encontrada." renderItem={(suggestion) => <>{suggestion.title}: {suggestion.reason}</>} />;
}
