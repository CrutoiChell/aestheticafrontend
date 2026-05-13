import Layout from "@/components/Layout";
import Link from "next/link";
import { Palette, Sparkles, Smartphone, Star, ArrowRight, Users, TrendingUp } from "lucide-react";
import { apiUrl } from "@/lib/api";
import styles from "./page.module.css";

async function getStats() {
  try {
    const res = await fetch(apiUrl('/stats'), { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data;
  } catch {
    return { users: 0, exhibitions: 0, artworks: 0 };
  }
}

async function getRandomItem() {
  try {
    // Fetch artworks and exhibitions in parallel
    const [artRes, exRes] = await Promise.all([
      fetch(apiUrl('/artworks'), { cache: 'no-store' }),
      fetch(apiUrl('/exhibitions?limit=20'), { cache: 'no-store' }),
    ]);

    const artData = artRes.ok ? await artRes.json() : null;
    const exData = exRes.ok ? await exRes.json() : null;

    const artworks: any[] = (artData?.data?.artworks || [])
      .filter((a: any) => a.imageUrl)
      .map((a: any) => ({ type: 'artwork', imageUrl: a.imageUrl, title: a.title, sub: a.artist }));

    const exhibitions: any[] = (exData?.data?.exhibitions || [])
      .filter((e: any) => e.imageUrl)
      .map((e: any) => ({ type: 'exhibition', imageUrl: e.imageUrl, title: e.title, sub: e.gallery }));

    const pool = [...artworks, ...exhibitions];
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  } catch {
    return null;
  }
}

export default async function Home() {
  const [stats, randomItem] = await Promise.all([getStats(), getRandomItem()]);

  return (
    <Layout>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>Новая платформа для любителей искусства</span>
          </div>
          <h1 className={styles.heroTitle}>
            Откройте мир <span className={styles.gradient}>искусства</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Исследуйте выставки из лучших галерей мира в одном месте.
            Тысячи произведений искусства ждут вас.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/exhibitions" className={styles.primaryButton}>
              Смотреть выставки
              <ArrowRight size={20} />
            </Link>
            <Link href="/auth/register" className={styles.secondaryButton}>
              Начать бесплатно
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <Users size={24} />
              <div>
                <div className={styles.statNumber}>{stats.users}+</div>
                <div className={styles.statLabel}>Пользователей</div>
              </div>
            </div>
            <div className={styles.stat}>
              <Palette size={24} />
              <div>
                <div className={styles.statNumber}>{stats.exhibitions}+</div>
                <div className={styles.statLabel}>Выставок</div>
              </div>
            </div>
            <div className={styles.stat}>
              <TrendingUp size={24} />
              <div>
                <div className={styles.statNumber}>{stats.artworks}+</div>
                <div className={styles.statLabel}>Произведений</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroImage}>
          <div className={styles.floatingCard}>
            {randomItem ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={randomItem.imageUrl}
                  alt={randomItem.title}
                  className={styles.artworkImage}
                />
                <div className={styles.artworkOverlay}>
                  <p className={styles.artworkTitle}>{randomItem.title}</p>
                  <p className={styles.artworkArtist}>{randomItem.sub}</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.cardGradient}></div>
                <div className={styles.floatingIcon1}><Palette size={40} /></div>
                <div className={styles.floatingIcon2}><Sparkles size={32} /></div>
                <div className={styles.floatingIcon3}><Star size={28} /></div>
              </>
            )}
          </div>
        </div>
      </div>

      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Почему Aesthetica?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Palette size={48} /></div>
              <h3>Тысячи выставок</h3>
              <p>Доступ к коллекциям из галерей по всему миру</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Sparkles size={48} /></div>
              <h3>Разные стили</h3>
              <p>От классики до современного искусства</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Smartphone size={48} /></div>
              <h3>Удобный доступ</h3>
              <p>Просматривайте на любом устройстве</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><Star size={48} /></div>
              <h3>Персонализация</h3>
              <p>Сохраняйте любимые выставки</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaIcon}><Sparkles size={64} /></div>
          <h2>Начните своё путешествие в мир искусства</h2>
          <p>Присоединяйтесь к сообществу ценителей прекрасного</p>
          <Link href="/auth/register" className={styles.ctaButton}>
            Создать аккаунт бесплатно
            <ArrowRight size={20} />
          </Link>
        </div>
        <div className={styles.ctaBackground}>
          <div className={styles.ctaCircle1}></div>
          <div className={styles.ctaCircle2}></div>
          <div className={styles.ctaCircle3}></div>
        </div>
      </section>
    </Layout>
  );
}
