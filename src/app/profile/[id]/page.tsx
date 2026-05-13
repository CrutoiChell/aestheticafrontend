'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ExhibitionGrid from '@/components/ExhibitionGrid/ExhibitionGrid';
import { apiUrl } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import type { Exhibition } from '@/lib/types';
import styles from './page.module.css';
import { Loader2, AlertCircle, Shield, Calendar, Images, ArrowLeft } from 'lucide-react';

interface PublicUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role: string;
  createdAt: string;
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/users/${id}`))
      .then(r => r.json())
      .then(d => {
        if (!d.success) {
          setError(d.error?.message || 'Пользователь не найден');
          return;
        }
        setUser(d.data.user);
        setExhibitions(d.data.exhibitions || []);
      })
      .catch(err => {
        console.error('[PublicProfile] fetch failed:', err);
        setError('Ошибка загрузки профиля');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className={styles.stateWrap}>
          <Loader2 size={40} className={styles.spin} />
          <p>Загрузка профиля…</p>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className={styles.stateWrap}>
          <AlertCircle size={40} />
          <p>{error || 'Пользователь не найден'}</p>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowLeft size={16} /> Назад
          </button>
        </div>
      </Layout>
    );
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowLeft size={16} /> Назад
          </button>

          {/* Profile header */}
          <div className={styles.header}>
            <div className={styles.avatar}>
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveMediaUrl(user.avatarUrl)} alt={user.name} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </div>
            <div className={styles.info}>
              <h1 className={styles.name}>{user.name}</h1>
              {user.role === 'admin' && (
                <span className={styles.roleBadge}>
                  <Shield size={12} /> Администратор
                </span>
              )}
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
              <p className={styles.meta}>
                <Calendar size={14} />
                В сообществе с {new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Exhibitions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Images size={20} />
              Публичные выставки ({exhibitions.length})
            </h2>

            {exhibitions.length === 0 ? (
              <div className={styles.empty}>
                <Images size={44} />
                <p>У пользователя пока нет публичных выставок</p>
                <Link href="/exhibitions" className={styles.emptyLink}>Смотреть все выставки</Link>
              </div>
            ) : (
              <ExhibitionGrid exhibitions={exhibitions} />
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
