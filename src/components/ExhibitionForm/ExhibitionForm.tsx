'use client';

import { useState, useEffect } from 'react';
import type { Exhibition, ExhibitionFormData } from '@/lib/types';
import styles from './ExhibitionForm.module.css';

interface ExhibitionFormProps {
  exhibition?: Exhibition;
  onSubmit: (data: ExhibitionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ExhibitionForm({
  exhibition,
  onSubmit,
  onCancel,
  isLoading = false,
}: ExhibitionFormProps) {
  const [formData, setFormData] = useState<ExhibitionFormData>({
    title: '',
    description: '',
    gallery: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    location: '',
    isPublic: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExhibitionFormData, string>>>({});

  useEffect(() => {
    if (exhibition) {
      setFormData({
        title: exhibition.title,
        description: exhibition.description,
        gallery: exhibition.gallery,
        startDate: exhibition.startDate.split('T')[0], // Convert to YYYY-MM-DD
        endDate: exhibition.endDate.split('T')[0],
        imageUrl: exhibition.imageUrl,
        location: exhibition.location || '',
        isPublic: exhibition.isPublic,
      });
    }
  }, [exhibition]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExhibitionFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.gallery.trim()) {
      newErrors.gallery = 'Галерея обязательна';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Дата окончания обязательна';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'Дата окончания должна быть после даты начала';
      }
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Введите корректный URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ExhibitionFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>
        {exhibition ? 'Редактировать выставку' : 'Создать выставку'}
      </h2>

      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Название *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Описание *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="gallery" className={styles.label}>
          Галерея *
        </label>
        <input
          type="text"
          id="gallery"
          name="gallery"
          value={formData.gallery}
          onChange={handleChange}
          className={`${styles.input} ${errors.gallery ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.gallery && <span className={styles.error}>{errors.gallery}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate" className={styles.label}>
            Дата начала *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.startDate && (
            <span className={styles.error}>{errors.startDate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="endDate" className={styles.label}>
            Дата окончания *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.endDate && <span className={styles.error}>{errors.endDate}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="imageUrl" className={styles.label}>
          URL изображения *
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className={`${styles.input} ${errors.imageUrl ? styles.inputError : ''}`}
          disabled={isLoading}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && <span className={styles.error}>{errors.imageUrl}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="location" className={styles.label}>
          Местоположение
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className={styles.checkbox}
            disabled={isLoading}
          />
          <span>Публичная выставка (видна всем пользователям)</span>
        </label>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : exhibition ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}
