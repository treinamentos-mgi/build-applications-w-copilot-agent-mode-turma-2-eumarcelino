import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

const loadLeaderboard = () => getJson<LeaderboardResponse>('/api/leaderboard');

export default function Leaderboard() {
  const resource = useApiResource(loadLeaderboard);
  const entries = resource.status === 'success' ? resource.value.leaderboard : [];

  return (
    <CapabilityCard
      title="Placar"
      description="Classificação das equipes por pontos acumulados."
      loading={resource.status === 'loading'}
      error={resource.status === 'error'}
      empty={resource.status === 'success' && entries.length === 0}
      emptyMessage="Sem classificação disponível."
    >
      <ol className="list-group list-group-numbered" aria-label="Classificação das equipes">
        {entries.map((entry) => (
          <li className="list-group-item d-flex justify-content-between align-items-center gap-3" key={`${entry.rank}-${entry.teamName}`}>
            <span className="fw-semibold">{entry.teamName}</span>
            <span className="badge text-bg-success rounded-pill">{entry.totalPoints} pontos</span>
          </li>
        ))}
      </ol>
    </CapabilityCard>
  );
}
