import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  loading: boolean;
  error: boolean;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

export function CapabilityCard({ title, description, loading, error, empty, emptyMessage, children }: Props) {
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2 className="h4">{title}</h2>
        <p className="text-secondary mb-4">{description}</p>
        {loading && <p className="text-secondary mb-0" role="status">Carregando dados...</p>}
        {error && <p className="alert alert-danger mb-0" role="alert">Não foi possível carregar os dados. Tente novamente.</p>}
        {!loading && !error && empty && <p className="text-secondary mb-0" role="status">{emptyMessage}</p>}
        {!loading && !error && !empty && children}
      </div>
    </section>
  );
}
