import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members?: unknown[] };
type TeamsResponse = { teams: Team[] };

const loadTeams = () => getJson<TeamsResponse>('/api/teams');

export default function Teams() {
  const resource = useApiResource(loadTeams);
  const teams = resource.status === 'success' ? resource.value.teams : [];

  return (
    <CapabilityCard
      title="Equipes"
      description="Conheça as equipes e acompanhe seus integrantes."
      loading={resource.status === 'loading'}
      error={resource.status === 'error'}
      empty={resource.status === 'success' && teams.length === 0}
      emptyMessage="Nenhuma equipe cadastrada."
    >
      <ul className="list-group list-group-flush" aria-label="Equipes cadastradas">
        {teams.map((team, index) => {
          const memberCount = team.members?.length ?? 0;
          return (
            <li className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 px-0" key={team._id ?? `${team.name}-${index}`}>
              <div>
                <h3 className="h6 mb-1">{team.name}</h3>
                {team.mascot && <p className="text-secondary mb-0">Mascote: {team.mascot}</p>}
              </div>
              <span className="badge text-bg-light border text-dark">{memberCount} {memberCount === 1 ? 'integrante' : 'integrantes'}</span>
            </li>
          );
        })}
      </ul>
    </CapabilityCard>
  );
}
