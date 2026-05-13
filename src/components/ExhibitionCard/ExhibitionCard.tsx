'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon, User } from 'lucide-react';
import { Exhibition } from '@/lib/types';
import { exhibitionImageUrls, resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './ExhibitionCard.module.css';
import { Heart, MessageCircle } from 'lucide-react';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

export default function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const urlsRaw = exhibitionImageUrls(exhibition);
  const urls = urlsRaw.map(resolveMediaUrl).filter(Boolean);
  const poster = urls[0] || '';

  return (
    <Link href={`/exhibitions/${exhibition.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={exhibition.title} className={styles.image} loading="lazy" decoding="async" />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            <ImageIcon size={36} strokeWidth={1.25} />
          </div>
        )}
        {urls.length > 1 && <span className={styles.galleryBadge}>{urls.length}</span>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{exhibition.title}</h3>
        <p className={styles.gallery}>{exhibition.gallery}</p>
        {exhibition.authorName && (
          <span
            className={styles.author}
            onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/profile/${exhibition.userId}`); }}
            role="link"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && router.push(`/profile/${exhibition.userId}`)}
          >
            <User size={12} />
            {exhibition.authorName}
          </span>
        )}
        <p className={styles.dates}>
          {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}><Heart size={15} aria-hidden /><span>{exhibition.likesCount || 0}</span></div>
          <div className={styles.stat}><MessageCircle size={15} aria-hidden /><span>{exhibition.commentsCount || 0}</span></div>
        </div>
      </div>
    </Link>
  );
}
