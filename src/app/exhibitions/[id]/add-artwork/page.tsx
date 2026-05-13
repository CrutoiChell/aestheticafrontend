'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import { ArrowLeft, Upload, FileText, User, Hash, Sparkles, X, Plus } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function AddArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: new Date().getFullYear().toString(),
    description: '',
    medium: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/auth/login');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setError('Максимум 25MB'); return; }

    setUploading(true);
    setError(null);
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
      if (result.success) setImageUrl(result.data.url);
      else setError(result.error?.message || 'Ошибка загрузки');
    } catch { setError('Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Название обязательно'); return; }
    if (!formData.artist.trim()) { setError('Художник обязателен'); return; }
    if (!imageUrl) { setError('Загрузите изображение'); return; }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/artworks'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year) || new Date().getFullYear(),
          imageUrl,
          exhibitionId: id,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/exhibitions/${id}`), 1200);
      } else {
        setError(result.error?.message || 'Ошибка при добавлении');
      }
    } catch { setError('Ошибка сети'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <Layout>
        <div className={styles.pageWrapper}>
          <div className={styles.container}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}><Sparkles size={40} /></div>
              <h2 className={styles.successTitle}>Арт добавлен!</h2>
              <p className={styles.successText}>Возвращаемся к выставке...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.floatingCircle} style={{ top: '5%', left: '-10%' }}></div>
          <div className={styles.floatingCircle} style={{ bottom: '10%', right: '-10%' }}></div>

          <button className={styles.backButton} onClick={() => router.push(`/exhibitions/${id}`)}>
            <ArrowLeft size={16} /> Назад к выставке
          </button>

          <div className={styles.header}>
            <div className={styles.badge}><Sparkles size={14} /> Добавить произведение</div>
            <h1 className={styles.title}>Новый <span className={styles.gradient}>арт</span></h1>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}><X size={18} />{error}</div>
            )}

            {/* Image upload */}
            <div className={styles.uploadSection}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              {imageUrl ? (
                <div className={styles.imagePreview}>
                  <img src={imageUrl} alt="Preview" />
                  <button type="button" className={styles.removeImage} onClick={() => setImageUrl('')}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.uploadButton} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <div className={styles.spinner}></div> : (
                    <><Upload size={36} /><span>Загрузите изображение</span><small>JPG, PNG, GIF до 5MB</small></>
                  )}
                </button>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}><FileText size={16} />Название</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.input} placeholder="Название произведения" disabled={loading} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}><User size={16} />Художник</label>
                <input type="text" name="artist" value={formData.artist} onChange={handleChange} className={styles.input} placeholder="Имя художника" disabled={loading} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}><Hash size={16} />Год</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} className={styles.input} placeholder="2024" min="1" max="2100" disabled={loading} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}><FileText size={16} />Материал</label>
                <input type="text" name="medium" value={formData.medium} onChange={handleChange} className={styles.input} placeholder="Масло, холст" disabled={loading} />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}><FileText size={16} />Описание</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className={styles.textarea} placeholder="Расскажите об этом произведении..." rows={3} disabled={loading} />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" onClick={() => router.push(`/exhibitions/${id}`)} className={styles.secondaryButton} disabled={loading}>Отмена</button>
              <button type="submit" className={styles.primaryButton} disabled={loading || uploading}>
                {loading ? <><div className={styles.spinner}></div>Добавление...</> : <><Plus size={18} />Добавить арт</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
