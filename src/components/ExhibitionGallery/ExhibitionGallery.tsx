'use client';

import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './ExhibitionGallery.module.css';

type Props = {
  title: string;
  urls: string[];
};

export default function ExhibitionGallery({ title, urls }: Props) {
  const resolved = urls.map(resolveMediaUrl).filter(Boolean);
  /** По умолчанию — сетка всех фото; карусель — по переключателю */
  const [showCarousel, setShowCarousel] = useState(false);
  const [index, setIndex] = useState(0);

  const n = resolved.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!n) return;
      setIndex((i) => (i + dir + n) % n);
    },
    [n]
  );

  const openLightbox = useCallback((i: number) => {
    setIndex(i);
    setShowCarousel(true);
  }, []);

  if (n === 0) {
    return (
      <div className={styles.placeholder}>
        <ImageIcon size={40} aria-hidden />
        <p>Изображений нет</p>
      </div>
    );
  }

  const active = resolved[Math.min(index, n - 1)] ?? resolved[0];

  return (
    <div className={styles.root}>
      {n > 1 && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.modeBtn} ${!showCarousel ? styles.active : ''}`}
            onClick={() => setShowCarousel(false)}
            aria-pressed={!showCarousel}
          >
            Сетка ({n})
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${showCarousel ? styles.active : ''}`}
            onClick={() => setShowCarousel(true)}
            aria-pressed={showCarousel}
          >
            Карусель
          </button>
        </div>
      )}

      {!showCarousel ? (
        <div className={styles.tileGrid}>
          {resolved.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className={styles.tileWrap}
              onClick={() => openLightbox(i)}
              aria-label={`Открыть фото ${i + 1} — ${title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} — фото ${i + 1}`}
                className={styles.tileImg}
                loading={i > 12 ? 'lazy' : undefined}
              />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.viewport}>
            <div className={styles.viewportInner}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active}
                alt={`${title} — изображение ${index + 1} из ${n}`}
                className={styles.mainImg}
              />
              {n > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navPrev}`}
                    onClick={() => go(-1)}
                    aria-label="Предыдущее изображение"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navNext}`}
                    onClick={() => go(1)}
                    aria-label="Следующее изображение"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className={styles.counter} aria-live="polite">
                    {index + 1} / {n}
                  </span>
                </>
              )}
            </div>
          </div>
          {n > 1 && (
            <div className={styles.strip} role="tablist">
              {resolved.map((src, i) => (
                <button
                  key={`thumb-${src}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={`${styles.thumbWrap} ${i === index ? styles.thumbActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Миниатюра ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className={styles.thumbImg} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
