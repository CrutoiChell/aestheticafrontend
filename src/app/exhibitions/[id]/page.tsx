'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetExhibitionByIdQuery } from '@/store/api/exhibitionsApi';
import ArtworkCard from '@/components/ArtworkCard';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import { Heart, MessageCircle, Send, Trash2, ArrowLeft, Building2, MapPin, Calendar, Images, Plus, Users, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { exhibitionImageUrls, resolveMediaUrl } from '@/lib/mediaUrl';
import { apiUrl } from '@/lib/api';

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError, error } = useGetExhibitionByIdQuery(id);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [visibleArtworks, setVisibleArtworks] = useState(9);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (data?.exhibition) {
      setLikesCount(data.exhibition.likesCount || 0);
      fetchLikeStatus();
      fetchComments();
    }
  }, [data]);

  const fetchLikeStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/exhibitions/${id}/like-status`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setLiked(result.data.liked);
        setLikesCount(result.data.likesCount);
      }
    } catch (err) {
      console.error('[ExhibitionDetail] fetchLikeStatus failed:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(apiUrl(`/exhibitions/${id}/comments`));
      const result = await res.json();
      if (result.success) setComments(result.data.comments);
    } catch (err) {
      console.error('[ExhibitionDetail] fetchComments failed:', err);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    setLoadingLike(true);
    try {
      const res = await fetch(apiUrl(`/exhibitions/${id}/like`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setLiked(result.data.liked);
        setLikesCount(result.data.likesCount);
      }
    } catch (err) {
      console.error('[ExhibitionDetail] handleLike failed:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      const res = await fetch(apiUrl(`/exhibitions/${id}/comments`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      const result = await res.json();
      if (result.success) {
        setComments([result.data.comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('[ExhibitionDetail] handleCommentSubmit failed:', err);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/exhibitions/comments/${commentId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('[ExhibitionDetail] handleDeleteComment failed:', err);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'только что';
    if (m < 60) return `${m} мин назад`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ч назад`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days} дн назад`;
    return new Date(d).toLocaleDateString('ru-RU');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}><p>Загрузка выставки...</p></div>
        </div>
      </Layout>
    );
  }

  if (isError || !data?.exhibition) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>Выставка не найдена</p>
            {error && 'data' in error && (
              <p className={styles.errorDetails}>
                {(error.data as any)?.error?.message}
              </p>
            )}
            <button onClick={() => router.push('/exhibitions')} className={styles.backButton}>
              <ArrowLeft size={16} /> Вернуться к каталогу
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { exhibition, artworks } = data;
  const imgUrls = exhibitionImageUrls(exhibition).map(resolveMediaUrl).filter(Boolean);

  return (
    <Layout>
      <div className={styles.container}>
        <button onClick={() => router.push('/exhibitions')} className={styles.backButton}>
          <ArrowLeft size={16} /> Все выставки
        </button>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          {/* Left: images */}
          <div>
            {imgUrls.length > 0 ? (
              <>
                <div className={styles.mainImageWrap} onClick={() => setLightboxOpen(true)}>
                  <img
                    src={imgUrls[activeImg]}
                    alt={exhibition.title}
                    className={styles.mainImage}
                  />
                  <div className={styles.mainImageZoom}>
                    <Images size={24} />
                  </div>
                </div>
                {imgUrls.length > 1 && (
                  <div className={styles.thumbStrip}>
                    {imgUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                        onClick={() => setActiveImg(i)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.mainImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Images size={64} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className={styles.info}>
            <h1 className={styles.title}>{exhibition.title}</h1>

            <div className={styles.meta}>
              <p className={styles.metaRow}>
                <Building2 size={16} />
                <strong>{exhibition.gallery}</strong>
              </p>
              {exhibition.location && (
                <p className={styles.metaRow}>
                  <MapPin size={16} />
                  {exhibition.location}
                </p>
              )}
              <p className={styles.metaRow}>
                <Calendar size={16} />
                {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
              </p>
              {exhibition.authorName && (
                <p className={styles.metaRow}>
                  <User size={16} />
                  <Link href={`/profile/${exhibition.userId}`} className={styles.authorLink}>
                    {exhibition.authorName}
                  </Link>
                </p>
              )}
            </div>

            <p className={styles.description}>{exhibition.description}</p>

            <div className={styles.actions}>
              <button
                className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
                onClick={handleLike}
                disabled={loadingLike}
              >
                <Heart size={16} className={liked ? styles.heartFilled : ''} />
                {likesCount}
              </button>
              <div className={styles.commentCount}>
                <MessageCircle size={16} />
                {comments.length}
              </div>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* ── Artworks ── */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Images size={20} />
              Произведения ({artworks.length})
            </h2>
            {/* Show add button if owner or allowUserImages */}
            {(currentUserId === exhibition.userId || exhibition.allowUserImages) && currentUserId && (
              <button
                className={styles.addArtButton}
                onClick={() => router.push(`/exhibitions/${id}/add-artwork`)}
              >
                <Plus size={16} />
                Добавить арт
              </button>
            )}
          </div>
          {exhibition.allowUserImages && currentUserId !== exhibition.userId && (
            <p className={styles.openCollectionNote}>
              <Users size={14} />
              Открытая коллекция — вы можете добавить свои арты
            </p>
          )}
          {artworks.length === 0 ? (
            <p className={styles.noArtworks}>В этой выставке пока нет произведений искусства</p>
          ) : (
            <>
              <div className={styles.artworksGrid}>
                {artworks.slice(0, visibleArtworks).map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
              {visibleArtworks < artworks.length && (
                <div className={styles.loadMoreWrap}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={() => setVisibleArtworks(v => v + 9)}
                  >
                    Показать ещё ({artworks.length - visibleArtworks})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <hr className={styles.divider} style={{ marginTop: '2.5rem' }} />

        {/* ── Comments ── */}
        <div className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>
            <MessageCircle size={20} />
            Комментарии ({comments.length})
          </h2>

          <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <input
              type="text"
              placeholder="Оставьте комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.commentInput}
              disabled={loadingComment}
            />
            <button
              type="submit"
              className={styles.commentSubmit}
              disabled={loadingComment || !newComment.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>Пока нет комментариев. Будьте первым!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.userName || 'Аноним'}</span>
                    <span className={styles.commentDate}>{formatRelative(comment.createdAt)}</span>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                  {currentUserId === comment.userId && (
                    <button
                      className={styles.deleteComment}
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && imgUrls.length > 0 && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>✕</button>
          {imgUrls.length > 1 && (
            <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + imgUrls.length) % imgUrls.length); }}>‹</button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrls[activeImg]} alt={exhibition.title} className={styles.lightboxImg} onClick={e => e.stopPropagation()} />
          {imgUrls.length > 1 && (
            <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % imgUrls.length); }}>›</button>
          )}
          {imgUrls.length > 1 && (
            <div className={styles.lightboxCounter}>{activeImg + 1} / {imgUrls.length}</div>
          )}
        </div>
      )}
    </Layout>
  );
}
