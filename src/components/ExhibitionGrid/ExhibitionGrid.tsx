'use client';

import { Exhibition } from '@/lib/types';
import ExhibitionCard from '@/components/ExhibitionCard/ExhibitionCard';
import styles from './ExhibitionGrid.module.css';

interface ExhibitionGridProps {
  exhibitions: Exhibition[];
}

export default function ExhibitionGrid({ exhibitions }: ExhibitionGridProps) {
  if (exhibitions.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Выставки не найдены.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {exhibitions.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
      ))}
    </div>
  );
}
