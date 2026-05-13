'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import { Plus, Upload, MapPin, Building2, FileText, Globe, Sparkles, X, Users, Save } from 'lucide-react';
import { apiUrl } from '@/lib/api';

function CreateExhibitionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gallery: '',
    location: '',
    isPublic: true,
    allowUserImages: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Load existing exhibition when in edit mode
  useEffect(() => {
    if (!editId || !isAuthenticated) return;
    setLoadingExisting(true);
    fetch(apiUrl(`/exhibitions/${editId}`))
      .then(r => r.json())
      .then(d => {
        if (!d.success) {
          setError(d.error?.message || 'Выставка не найдена');
          return;
        }
        const ex = d.data.exhibition;
        setFormData({
          title: ex.title || '',
          description: ex.description || '',
          gallery: ex.gallery || '',
          location: ex.location || '',
          isPublic: ex.isPublic ?? true,
          allowUserImages: ex.allowUserImages ?? false,
        });
        setImages(Array.isArray(ex.imageUrls) && ex.imageUrls.length ? ex.imageUrls : [ex.imageUrl].filter(Boolean));
      })
      .catch(err => {
        console.error('[CreateExhibition] load existing failed:', err);
        setError('Не удалось загрузить выставку');
      })
      .finally(() => setLoadingExisting(false));
  }, [editId, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    if (images.length + files.length > 5) {
      setError('Максимум 5 изображений');
      return;
    }

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];

    try {
      const token = localStorage.getItem('token');

      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) {
          setError(`Файл ${file.name} слишком большой. Максимум 25MB`);
          continue;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const response = await fetch(apiUrl('/upload'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData,
        });

        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.data.url);
        } else {
          setError(result.error?.message || `Ошибка загрузки ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
      }
    } catch {
      setError('Ошибка загрузки файлов');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) await uploadFiles(files);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title.trim()) {
      setError('Название обязательно');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Описание обязательно');
      setLoading(false);
      return;
    }
    if (!formData.gallery.trim()) {
      setError('Галерея обязательна');
      setLoading(false);
      return;
    }
    if (images.length === 0) {
      setError('Загрузите хотя бы одно изображение');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode ? apiUrl(`/exhibitions/${editId}`) : apiUrl('/exhibitions');
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: images[0],
          imageUrls: images,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        const goToId = isEditMode ? editId : result.data.exhibition.id;
        setTimeout(() => {
          router.push(`/exhibitions/${goToId}`);
        }, 1200);
      } else {
        setError(result.error?.message || 'Ошибка при сохранении выставки');
      }
    } catch (err) {
      console.error('[CreateExhibition] submit failed:', err);
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loadingExisting) {
    return (
      <Layout>
        <div className={styles.pageWrapper}>
          <div className={styles.container}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <div className={styles.spinner} style={{ width: 32, height: 32 }}></div>
              </div>
              <h2 className={styles.successTitle}>Загрузка выставки...</h2>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className={styles.pageWrapper}>
          <div className={styles.container}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <Sparkles size={48} />
              </div>
              <h2 className={styles.successTitle}>
                {isEditMode ? 'Выставка обновлена!' : 'Выставка создана!'}
              </h2>
              <p className={styles.successText}>Перенаправляем вас на страницу выставки...</p>
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
          <div className={styles.floatingCircle} style={{ top: '50%', right: '-10%' }}></div>
          <div className={styles.floatingCircle} style={{ bottom: '0%', left: '30%' }}></div>

          <div className={styles.header}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              {isEditMode ? 'Редактирование коллекции' : 'Создайте свою коллекцию'}
            </div>
            <h1 className={styles.title}>
              {isEditMode ? 'Редактировать' : 'Новая'} <span className={styles.gradient}>выставка</span>
            </h1>
            <p className={styles.subtitle}>
              {isEditMode
                ? 'Обновите информацию о вашей выставке'
                : 'Поделитесь своей коллекцией произведений искусства с миром'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}>
                <X size={20} />
                {error}
              </div>
            )}

            <div className={styles.uploadSection}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              {images.length > 0 ? (
                <div
                  className={`${styles.imagesGrid} ${isDragging ? styles.imagesGridDragging : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {images.map((url, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                      {index === 0 && <div className={styles.mainImageBadge}>Главная</div>}
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      className={styles.addMoreButton}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className={styles.spinner}></div>
                      ) : (
                        <>
                          <Plus size={32} />
                          <small>Добавить ({5 - images.length})</small>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={`${styles.uploadButton} ${isDragging ? styles.uploadButtonDragging : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload size={40} />
                      <span>{isDragging ? 'Отпустите файлы' : 'Перетащите или нажмите'}</span>
                      <small>До 5 фото • JPG, PNG, GIF, WEBP • до 25MB каждое</small>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={18} />
                  Название выставки
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Современное искусство 2024"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Building2 size={18} />
                  Галерея
                </label>
                <input
                  type="text"
                  name="gallery"
                  value={formData.gallery}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Название галереи"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>
                  <FileText size={18} />
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Расскажите о вашей выставке..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MapPin size={18} />
                  Местоположение
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Москва, Россия"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroupFull}>
                <div className={styles.togglesRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className={styles.checkbox}
                      disabled={loading}
                    />
                    <Globe size={18} />
                    <div>
                      <span>Публичная выставка</span>
                      <small>Видна всем пользователям</small>
                    </div>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="allowUserImages"
                      checked={formData.allowUserImages}
                      onChange={handleChange}
                      className={styles.checkbox}
                      disabled={loading}
                    />
                    <Users size={18} />
                    <div>
                      <span>Открытая коллекция</span>
                      <small>Другие могут добавлять арты</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.secondaryButton}
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading || uploading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    {isEditMode ? 'Сохранение...' : 'Создание...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? <Save size={20} /> : <Plus size={20} />}
                    {isEditMode ? 'Сохранить' : 'Создать выставку'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default function CreateExhibitionPage() {
  return (
    <Suspense fallback={null}>
      <CreateExhibitionInner />
    </Suspense>
  );
}
