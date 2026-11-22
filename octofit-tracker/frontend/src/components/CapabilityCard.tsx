import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  loadItems: () => Promise<T[]>;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, loadItems, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(false);
    loadItems()
      .then((data) => { if (active) setItems(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2>
    {error ? <p role="alert">Não foi possível carregar os dados.</p> : items === null ? <p role="status">Carregando...</p> : items.length === 0 ? <p>{emptyText}</p> : <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
