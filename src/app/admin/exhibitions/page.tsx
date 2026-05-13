'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import {
  Plus, Pencil, Trash2, Eye, Loader2, AlertCircle,
  CheckCircle, Images, ArrowLeft, X, Sparkles
} from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface ExhibitionRow {
  id: string;
  title: string;
  gallery: string;
  isPublic: boolean;
  allowUserImages: boolean;
  likesCount: number;
  artworksCount: number;
  startDate: string;
  endDate: string;
}

export default function AdminExhibitionsPage() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<ExhibitionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/auth/login'); return; }
    loadExhibitions();
  }, [router]);

  const loadExhibitions = async () => {
    setLoading(true);
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(apiUrl('/users/my-exhibitions'), {
        headers: { Authorization: `Bearer ${t}` },
      });
      const d = await res.json();
      if (d.success) setExhibitions(d.data.exhibitions);
    } catch { setError('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/exhibitions/${deleteId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await res.json();
      if (d.success) {
        setExhibitions(prev => prev.filter(e => e.id !== deleteId));
        flash('Выставка удалена');
      } else {
        setError(d.error?.message || 'Ошибка удаления');
      }
    } catch { setError('Ошибка удаления'); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>

          <div className={styles.header}>
            <div>
              <div className={styles.badge}><Images size={14} />Управление</div>
              <h1 className={styles.title}>Мои <span className={styles.gradient}>выставки</span></h1>
              <p className={styles.subtitle}>Создавайте и управляйте своими коллекциями</p>
            </div>
            <Link href="/create-exhibition" className={styles.createBtn}>
              <Plus size={18} />
              Создать выставку
            </Link>
          </div>

          {success && (
            <div className={styles.successAlert}><CheckCircle size={16} />{success}</div>
          )}
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={16} />{error}
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingState}>
              <Loader2 size={36} className={styles.spin} />
              <p>Загрузка выставок...</p>
            </div>
          ) : exhibitions.length === 0 ? (
            <div className={styles.emptyState}>
              <Images size={56} strokeWidth={1} />
              <h2>Выставок пока нет</h2>
              <p>Создайте свою первую коллекцию произведений искусства</p>
              <Link href="/create-exhibition" className={styles.createBtn}>
                <Plus size={16} />
                Создать первую выставку
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {exhibitions.map(ex => (
                <div key={ex.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.badge2} ${ex.isPublic ? styles.badgePublic : styles.badgePrivate}`}>
                        {ex.isPublic ? 'Публичная' : 'Приватная'}
                      </span>
                      {ex.allowUserImages && (
                        <span className={styles.badge2 + ' ' + styles.badgeOpen}>Открытая</span>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <Link href={`/exhibitions/${ex.id}`} className={styles.actionBtn} title="Просмотр">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/create-exhibition?edit=${ex.id}`} className={styles.actionBtn} title="Редактировать">
                        <Pencil size={15} />
                      </Link>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteId(ex.id)} title="Удалить">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className={styles.cardTitle}>{ex.title}</h3>
                  <p className={styles.cardGallery}>{ex.gallery}</p>
                  <p className={styles.cardDates}>{fmt(ex.startDate)} — {fmt(ex.endDate)}</p>

                  <div className={styles.cardStats}>
                    <span>❤ {ex.likesCount}</span>
                    <span>🖼 {ex.artworksCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className={styles.modal} onClick={() => setDeleteId(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}><Trash2 size={28} /></div>
            <h2 className={styles.modalTitle}>Удалить выставку?</h2>
            <p className={styles.modalText}>Это действие нельзя отменить. Все арты и комментарии будут удалены.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteId(null)} disabled={deleting}>Отмена</button>
              <button className={styles.modalDelete} onClick={handleDelete} disabled={deleting}>
                {deleting ? <><Loader2 size={16} className={styles.spin} />Удаление...</> : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
