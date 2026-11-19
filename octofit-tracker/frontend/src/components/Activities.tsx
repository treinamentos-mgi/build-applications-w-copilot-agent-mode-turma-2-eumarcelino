import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

const loadActivities = () => getJson<ActivitiesResponse>('/api/activities');
const activityLabels: Record<string, string> = {
  run: 'Corrida',
  cycle: 'Ciclismo',
  strength: 'Força',
  walk: 'Caminhada',
};

export default function Activities() {
  const resource = useApiResource(loadActivities);
  const activities = resource.status === 'success' ? resource.value.activities : [];

  return (
    <CapabilityCard
      title="Atividades"
      description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
      loading={resource.status === 'loading'}
      error={resource.status === 'error'}
      empty={resource.status === 'success' && activities.length === 0}
      emptyMessage="Nenhuma atividade registrada."
    >
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <caption className="visually-hidden">Atividades registradas</caption>
          <thead>
            <tr><th scope="col">Atividade</th><th scope="col">Duração</th><th scope="col">Pontos</th></tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={activity._id ?? `${activity.type}-${index}`}>
                <th scope="row">{activityLabels[activity.type] ?? activity.type}</th>
                <td>{activity.minutes} min</td>
                <td>{activity.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CapabilityCard>
  );
}
