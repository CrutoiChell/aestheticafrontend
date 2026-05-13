'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import {
  User, Mail, Shield, Camera, Save, Loader2,
  CheckCircle, AlertCircle, Heart, Images, Plus, X, Pencil
} from 'lucide-react';
import type { Exhibition } from '@/lib/types';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { apiUrl } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

type Tab = 'exhibitions' | 'liked';

export default function ProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<Tab>('exhibitions');
  const [myExhibitions, setMyExhibitions] = useState<Exhibition[]>([]);
  const [likedExhibitions, setLikedExhibitions] = useState<Exhibition[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    fetchProfile(token);
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingContent(true);
    if (tab === 'exhibitions') {
      fetchMyExhibitions(token).finally(() => setLoadingContent(false));
    } else {
      fetchLikedExhibitions(token).finally(() => setLoadingContent(false));
    }
  }, [tab, profile]);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(apiUrl('/users/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      setProfile(data.data.user);
      setFormData({
        name: data.data.user.name,
        email: data.data.user.email,
        bio: data.data.user.bio || '',
      });
    } catch {
      setError('Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyExhibitions = async (token: string) => {
    try {
      const res = await fetch(apiUrl('/users/my-exhibitions'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyExhibitions(data.data.exhibitions);
    } catch (err) {
      console.error('[Profile] fetchMyExhibitions failed:', err);
    }
  };

  const fetchLikedExhibitions = async (token: string) => {
    try {
      const res = await fetch(apiUrl('/users/liked-exhibitions'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLikedExhibitions(data.data.exhibitions);
    } catch (err) {
      console.error('[Profile] fetchLikedExhibitions failed:', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setError('Максимум 25MB'); return; }

    setIsUploadingAvatar(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(apiUrl('/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message);

      // Save avatar URL to profile
      const saveRes = await fetch(apiUrl('/users/profile'), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: result.data.url }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        setProfile(prev => prev ? { ...prev, avatarUrl: result.data.url } : prev);
        setSuccess('Аватар обновлён!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки аватара');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/users/profile'), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      setProfile(data.data.user);
      setSuccess('Профиль сохранён!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({ name: profile.name, email: profile.email, bio: profile.bio || '' });
    }
    setIsEditing(false);
    setError('');
  };

  const displayList = tab === 'exhibitions' ? myExhibitions : likedExhibitions;

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loadingPage}>
          <Loader2 size={40} className={styles.spin} />
          <p>Загрузка профиля...</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className={styles.loadingPage}>
          <AlertCircle size={40} />
          <p>Профиль не найден</p>
        </div>
      </Layout>
    );
  }

  const initials = profile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.layout}>

          {/* ── LEFT: profile card ── */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              {/* Avatar */}
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>
                  {profile.avatarUrl ? (
                    <img src={resolveMediaUrl(profile.avatarUrl)} alt={profile.name} className={styles.avatarImg} />
                  ) : (
                    <span className={styles.avatarInitials}>{initials}</span>
                  )}
                </div>
                <button
                  className={styles.avatarEditBtn}
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Изменить аватар"
                >
                  {isUploadingAvatar ? <Loader2 size={14} className={styles.spin} /> : <Camera size={14} />}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <h2 className={styles.profileName}>{profile.name}</h2>
              <p className={styles.profileEmail}>{profile.email}</p>

              <div className={styles.roleBadge}>
                <Shield size={13} />
                {profile.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </div>

              {/* Alerts */}
              {success && (
                <div className={styles.successMsg}>
                  <CheckCircle size={16} />{success}
                </div>
              )}
              {error && (
                <div className={styles.errorMsg}>
                  <AlertCircle size={16} />{error}
                  <button onClick={() => setError('')}><X size={14} /></button>
                </div>
              )}

              {/* View mode */}
              {!isEditing ? (
                <div className={styles.viewMode}>
                  <div className={styles.viewRow}>
                    <span className={styles.viewLabel}><User size={13} />Имя</span>
                    <span className={styles.viewValue}>{profile.name}</span>
                  </div>
                  <div className={styles.viewRow}>
                    <span className={styles.viewLabel}><Mail size={13} />Email</span>
                    <span className={styles.viewValue}>{profile.email}</span>
                  </div>
                  {profile.bio && (
                    <div className={styles.viewRow}>
                      <span className={styles.viewLabel}><User size={13} />О себе</span>
                      <span className={styles.viewValue}>{profile.bio}</span>
                    </div>
                  )}
                  <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                    <Pencil size={15} />
                    Редактировать
                  </button>
                </div>
              ) : (
                /* Edit form */
                <form onSubmit={handleSave} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}><User size={14} />Имя</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}><Mail size={14} />Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}><User size={14} />О себе</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                      className={styles.textarea}
                      rows={3}
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit} disabled={isSaving}>
                      Отмена
                    </button>
                    <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                      {isSaving ? <><Loader2 size={15} className={styles.spin} />Сохранение...</> : <><Save size={15} />Сохранить</>}
                    </button>
                  </div>
                </form>
              )}

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{myExhibitions.length}</span>
                  <span className={styles.statLabel}>Выставок</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{likedExhibitions.length}</span>
                  <span className={styles.statLabel}>Лайков</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: content ── */}
          <main className={styles.content}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === 'exhibitions' ? styles.tabActive : ''}`}
                onClick={() => setTab('exhibitions')}
              >
                <Images size={16} />
                Мои выставки
              </button>
              <button
                className={`${styles.tab} ${tab === 'liked' ? styles.tabActive : ''}`}
                onClick={() => setTab('liked')}
              >
                <Heart size={16} />
                Понравилось
              </button>

              {tab === 'exhibitions' && (
                <Link href="/create-exhibition" className={styles.createBtn}>
                  <Plus size={16} />
                  Создать
                </Link>
              )}
            </div>

            {loadingContent ? (
              <div className={styles.contentLoading}>
                <Loader2 size={32} className={styles.spin} />
              </div>
            ) : displayList.length === 0 ? (
              <div className={styles.empty}>
                {tab === 'exhibitions' ? (
                  <>
                    <Images size={48} strokeWidth={1} />
                    <p>У вас пока нет выставок</p>
                    <Link href="/create-exhibition" className={styles.emptyAction}>
                      <Plus size={16} /> Создать первую
                    </Link>
                  </>
                ) : (
                  <>
                    <Heart size={48} strokeWidth={1} />
                    <p>Вы ещё ничего не лайкнули</p>
                    <Link href="/exhibitions" className={styles.emptyAction}>
                      Смотреть выставки
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.grid}>
                {displayList.map(ex => {
                  const img = resolveMediaUrl(ex.imageUrl);
                  return (
                    <Link key={ex.id} href={`/exhibitions/${ex.id}`} className={styles.exCard}>
                      <div className={styles.exImg}>
                        {img ? (
                          <img src={img} alt={ex.title} />
                        ) : (
                          <div className={styles.exImgPlaceholder}><Images size={28} strokeWidth={1} /></div>
                        )}
                        {!ex.isPublic && <span className={styles.privateBadge}>Приватная</span>}
                      </div>
                      <div className={styles.exInfo}>
                        <h3 className={styles.exTitle}>{ex.title}</h3>
                        <p className={styles.exGallery}>{ex.gallery}</p>
                        <div className={styles.exStats}>
                          <span><Heart size={13} /> {ex.likesCount}</span>
                          <span><Images size={13} /> {ex.artworksCount}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
