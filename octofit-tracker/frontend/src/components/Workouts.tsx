import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutsResponse = { suggestions: Workout[] };

const loadWorkouts = () => getJson<WorkoutsResponse>('/api/workouts/suggestions/mona%40example.com');

export default function Workouts() {
  const resource = useApiResource(loadWorkouts);
  const workouts = resource.status === 'success' ? resource.value.suggestions : [];

  return (
    <CapabilityCard
      title="Sugestões de treino"
      description="Recomendações para apoiar a rotina de atividades."
      loading={resource.status === 'loading'}
      error={resource.status === 'error'}
      empty={resource.status === 'success' && workouts.length === 0}
      emptyMessage="Nenhuma sugestão de treino disponível."
    >
      <ul className="list-group list-group-flush" aria-label="Sugestões de treino">
        {workouts.map((workout) => (
          <li className="list-group-item px-0" key={workout.title}>
            <h3 className="h6">{workout.title}</h3>
            {workout.focus && <p className="mb-1">Foco: {workout.focus}</p>}
            {(workout.minutes || workout.difficulty) && <p className="text-secondary mb-1">{workout.minutes ? `${workout.minutes} min` : ''}{workout.minutes && workout.difficulty ? ' · ' : ''}{workout.difficulty ?? ''}</p>}
            {workout.reason && <p className="mb-0">{workout.reason}</p>}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
