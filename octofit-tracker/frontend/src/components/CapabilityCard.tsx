import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  path: string;
  dataKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, path, dataKey, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(false);
    getJson<Record<string, T[]>>(path)
      .then((data) => { if (active) setItems(data[dataKey]); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [path, dataKey]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2>
    {error ? <p role="alert">Não foi possível carregar os dados.</p> : items === null ? <p role="status">Carregando...</p> : items.length === 0 ? <p>{emptyText}</p> : <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
