'use client';

import { useState } from 'react';
import { Artwork } from '@/lib/types';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './ArtworkCard.module.css';
import { ImageIcon, X, ZoomIn } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const src = resolveMediaUrl(artwork.imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className={styles.card} onClick={() => src && setLightboxOpen(true)}>
        <div className={styles.imageWrap}>
          {src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={artwork.title} className={styles.image} loading="lazy" />
              <div className={styles.zoomOverlay}>
                <ZoomIn size={28} />
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon size={32} strokeWidth={1.25} />
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{artwork.title}</h3>
          <p className={styles.artist}>{artwork.artist}</p>
          <p className={styles.year}>{artwork.year}{artwork.medium ? ` · ${artwork.medium}` : ''}</p>
        </div>
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>
            <X size={24} />
          </button>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={artwork.title} className={styles.lightboxImage} />
            <div className={styles.lightboxInfo}>
              <h2 className={styles.lightboxTitle}>{artwork.title}</h2>
              <p className={styles.lightboxArtist}>{artwork.artist}</p>
              <p className={styles.lightboxMeta}>
                {artwork.year}
                {artwork.medium && <span> · {artwork.medium}</span>}
                {artwork.dimensions && (
                  <span> · {artwork.dimensions.width}×{artwork.dimensions.height} {artwork.dimensions.unit}</span>
                )}
              </p>
              {artwork.description && (
                <p className={styles.lightboxDesc}>{artwork.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
