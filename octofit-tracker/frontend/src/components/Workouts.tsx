import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };
const loadSuggestions = () => getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`).then((data) => data.suggestions);

export default function Workouts() {
  return <CapabilityCard<Suggestion> title="Sugestões de treino" loadItems={loadSuggestions} emptyText="Nenhuma sugestão encontrada." renderItem={(suggestion) => <>{suggestion.title}: {suggestion.reason}</>} />;
}
