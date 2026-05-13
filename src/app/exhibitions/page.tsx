'use client';

import { useState, useEffect, useRef } from 'react';
import ExhibitionGrid from '@/components/ExhibitionGrid/ExhibitionGrid';
import SearchBar from '@/components/SearchBar';
import Layout from '@/components/Layout';
import type { Exhibition } from '@/lib/types';
import { Loader2, AlertCircle, Images, ChevronDown } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import styles from './page.module.css';

const PAGE_SIZE = 12;

export default function ExhibitionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [list, setList] = useState<Exhibition[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Use ref so fetch doesn't re-create on every render
  const searchRef = useRef(searchQuery);

  const fetchExhibitions = async (search: string, offset: number, append: boolean) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(offset));

    const res = await fetch(apiUrl(`/exhibitions?${params}`));
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    return json.data as { exhibitions: Exhibition[]; total: number };
  };

  // Initial load — only once
  useEffect(() => {
    fetchExhibitions('', 0, false)
      .then(d => { setList(d.exhibitions); setTotal(d.total); })
      .catch(() => setFetchError('Не удалось загрузить выставки'))
      .finally(() => setInitialLoading(false));
  }, []);

  // Search — triggered by query change, keeps SearchBar mounted
  useEffect(() => {
    if (initialLoading) return; // skip during initial load
    searchRef.current = searchQuery;
    setSearching(true);
    setFetchError(null);

    fetchExhibitions(searchQuery, 0, false)
      .then(d => {
        if (searchRef.current !== searchQuery) return; // stale
        setList(d.exhibitions);
        setTotal(d.total);
      })
      .catch(() => setFetchError('Не удалось загрузить выставки'))
      .finally(() => setSearching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleShowMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const d = await fetchExhibitions(searchQuery, list.length, true);
      setList(prev => [...prev, ...d.exhibitions]);
      setTotal(d.total);
    } catch {
      setFetchError('Не удалось загрузить ещё');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = list.length < total;

  if (initialLoading) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={styles.loading}>
              <Loader2 size={40} className={styles.spinner} />
              <p>Загружаем выставки...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.badge}>
              <Images size={14} aria-hidden />
              Каталог выставок
            </div>
            <h1 className={styles.title}>
              <span className={styles.titleGradient}>Выставки</span>
            </h1>
            <p className={styles.subtitle}>Все публичные выставки в одном каталоге</p>
          </header>

          <div className={styles.search}>
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {fetchError && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={24} />
              <p>{fetchError}</p>
            </div>
          )}

          {searching ? (
            <div className={styles.searchingIndicator}>
              <Loader2 size={20} className={styles.spinner} />
              <span>Поиск...</span>
            </div>
          ) : list.length === 0 ? (
            <div className={styles.empty}>
              <Images size={44} />
              <h2>Выставки не найдены</h2>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <p className={styles.count}>
                Показано <strong>{list.length}</strong> из <strong>{total}</strong>
              </p>
              <ExhibitionGrid exhibitions={list} />
              {hasMore && (
                <div className={styles.moreWrap}>
                  <button
                    type="button"
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className={styles.moreButton}
                  >
                    {loadingMore ? (
                      <><Loader2 size={16} className={styles.spinner} />Загрузка…</>
                    ) : (
                      <><ChevronDown size={16} />Показать ещё</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
