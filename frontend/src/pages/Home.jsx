import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../context/AuthContext';

/* ─── Inline styles (scoped to this page, no extra CSS file needed) ─── */
const styles = {
  /* Hero */
  heroWrap: {
    position: 'relative',
    minHeight: '92vh',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 'var(--border-radius-lg)',
    marginBottom: '5rem',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'url(/summer_hero.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%',
    filter: 'brightness(0.35)',
    transform: 'scale(1.04)',
    transition: 'transform 8s ease-out',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(236,72,153,0.35) 60%, transparent 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '640px',
  },
  chipBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#fff',
    marginBottom: '1.25rem',
  },
  heroTitle: {
    fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.1,
    marginBottom: '1.25rem',
    letterSpacing: '-0.02em',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '2rem',
    lineHeight: 1.7,
    maxWidth: '500px',
  },
  statPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '12px 24px',
  },
  statNum: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },

  /* Feature Bar */
  featureBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '5rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '1.2rem 1.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-glass)',
    boxShadow: 'var(--card-shadow)',
    transition: 'var(--transition-smooth)',
    cursor: 'default',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '1.4rem',
  },

  /* Section heading */
  sectionLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.4rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem',
  },

  /* Category card */
  catCard: {
    position: 'relative',
    borderRadius: 'var(--border-radius-md)',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: 'var(--card-shadow)',
    transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease',
    display: 'block',
  },
  catImg: {
    width: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.5s ease',
  },
  catOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 55%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.2rem',
  },

  /* Promo Banner */
  promoBanner: {
    borderRadius: 'var(--border-radius-lg)',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '5rem',
  },
  promoBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'url(https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.3)',
  },
  promoOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(99,102,241,0.7) 0%, rgba(236,72,153,0.5) 100%)',
  },

  /* Testimonials */
  testimonialCard: {
    borderRadius: 'var(--border-radius-md)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-glass)',
    boxShadow: 'var(--card-shadow)',
    padding: '1.8rem',
    height: '100%',
    transition: 'var(--transition-smooth)',
  },
  quoteIcon: {
    fontSize: '3rem',
    lineHeight: 1,
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    display: 'block',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)',
  },

  /* Marquee */
  marqueeOuter: {
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '5rem',
    padding: '1.5rem 0',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-glass)',
    borderBottom: '1px solid var(--border-glass)',
  },
  marqueeTrack: {
    display: 'flex',
    gap: '4rem',
    animation: 'marquee-scroll 28s linear infinite',
    width: 'max-content',
  },
  brandText: {
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: 'var(--text-muted)',
    opacity: 0.55,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transition: 'opacity 0.2s',
  },

  /* Newsletter */
  newsletterWrap: {
    borderRadius: 'var(--border-radius-lg)',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    padding: 'clamp(2.5rem, 5vw, 4rem)',
    textAlign: 'center',
    marginBottom: '5rem',
    boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  newsletterCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
  },
};

/* ─── Data ─── */
const FEATURES = [
  { icon: 'bi-truck', label: 'Free Shipping', sub: 'On orders over $50', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { icon: 'bi-arrow-return-left', label: 'Easy Returns', sub: '30-day free returns', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { icon: 'bi-shield-check', label: 'Secure Payments', sub: '256-bit SSL encrypted', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  { icon: 'bi-headset', label: '24/7 Support', sub: 'Always here to help', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
];

const CATEGORIES = [
  { name: "Men's Fashion", tag: 'New Season', image: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=700&q=80', link: '/shop?category=1', height: '380px' },
  { name: "Women's Fashion", tag: 'Trending', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80', link: '/shop?category=2', height: '380px' },
  { name: 'Accessories', tag: 'Top Picks', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=700&q=80', link: '/shop?category=3', height: '380px' },
  { name: 'Footwear', tag: 'Limited Stock', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80', link: '/shop?category=4', height: '380px' },
];

const TESTIMONIALS = [
  {
    text: "Absolutely love the quality! The clothes are exactly as shown in the photos. Fast shipping and great customer service. Will definitely order again!",
    name: 'Amelia Watson',
    role: 'Verified Buyer',
    stars: 5,
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    text: "Best online fashion store I've used. The checkout is seamless, the PDF invoice arrived instantly, and my order came two days early. Superb!",
    name: 'James Rivera',
    role: 'Verified Buyer',
    stars: 5,
    avatar: 'https://i.pravatar.cc/80?img=11',
  },
  {
    text: "The premium quality at these prices is unreal. I ordered three outfits and they all fit perfectly. The packaging was also premium — felt like a luxury unboxing!",
    name: 'Sophia Chen',
    role: 'Verified Buyer',
    stars: 5,
    avatar: 'https://i.pravatar.cc/80?img=23',
  },
];

const BRANDS = ['ZARA', 'H&M', 'NIKE', 'ADIDAS', 'GUCCI', 'VERSACE', 'PRADA', 'LEVI\'S', 'CALVIN KLEIN', 'TOMMY'];

/* ─── Helper components ─── */
const StarRating = ({ count }) => (
  <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <i
        key={i}
        className={i < count ? 'bi bi-star-fill' : 'bi bi-star'}
        style={{ color: '#f59e0b', fontSize: '0.85rem' }}
      />
    ))}
  </div>
);

/* ─── Main Component ─── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroBgRef = useRef(null);

  useEffect(() => {
    // Slight delay to trigger hero animation
    requestAnimationFrame(() => setHeroVisible(true));

    const fetchHomeData = async () => {
      try {
        // Use allSettled so a 403 on one endpoint doesn't kill the other
        const [prodResult, catResult] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/categories'),
        ]);
        if (prodResult.status === 'fulfilled') {
          setFeaturedProducts(prodResult.value.data);
        } else {
          console.error('Featured products error:', prodResult.reason);
        }
        if (catResult.status === 'fulfilled') {
          setCategories(catResult.value.data);
        } else {
          console.error('Categories error:', catResult.reason);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Hero parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroBgRef.current) {
        const y = window.scrollY * 0.3;
        heroBgRef.current.style.transform = `scale(1.04) translateY(${y}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCategoryLink = (cat) => {
    const match = categories.find((c) => c.name.toLowerCase() === cat.name.split("'")[0].trim().toLowerCase());
    return match ? `/shop?category=${match.id}` : cat.link;
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 6000);
    }
  };

  return (
    <>
      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        .hero-cta-primary {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #fff;
          border: none;
          font-weight: 700;
          padding: 0.9rem 2.2rem;
          border-radius: 100px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          animation: pulse-glow 2.5s infinite;
        }
        .hero-cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(99,102,241,0.5);
          color: #fff;
        }
        .hero-cta-secondary {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.35);
          font-weight: 600;
          padding: 0.9rem 2.2rem;
          border-radius: 100px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .hero-cta-secondary:hover {
          background: rgba(255,255,255,0.22);
          color: #fff;
          transform: translateY(-3px);
        }
        .feature-item-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.1) !important;
          border-color: rgba(99,102,241,0.25) !important;
        }
        .cat-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2) !important;
        }
        .cat-card-hover:hover img {
          transform: scale(1.08);
        }
        .testimonial-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 50px rgba(99,102,241,0.12) !important;
        }
        .brand-item:hover {
          opacity: 1 !important;
          color: var(--primary) !important;
        }
        .scroll-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .promo-count-badge {
          display: inline-block;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 1rem;
        }
        .newsletter-input {
          flex: 1;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 100px;
          padding: 0.85rem 1.5rem;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.55); }
        .newsletter-input:focus { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }
        .newsletter-btn {
          background: #fff;
          color: var(--primary);
          font-weight: 700;
          padding: 0.85rem 2rem;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .newsletter-btn:hover { transform: scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
      `}</style>

      <div className="container-fluid px-3 px-md-4" style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* ══════════════════════ HERO ══════════════════════ */}
        <div style={styles.heroWrap}>
          <div
            ref={heroBgRef}
            style={{
              ...styles.heroBg,
              transform: heroVisible ? 'scale(1.04)' : 'scale(1.12)',
            }}
          />
          <div style={styles.heroOverlay} />

          <div className="px-4 px-md-5 py-5 w-100">
            <div style={{ ...styles.heroContent, animation: heroVisible ? 'fadeUp 0.9s ease both' : 'none' }}>
              <div style={styles.chipBadge}>
                <i className="bi bi-stars" />
                Summer 2026 Collection
              </div>

              <h1 style={styles.heroTitle}>
                Dress Like You<br />
                <span style={{
                  background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Mean It.
                </span>
              </h1>

              <p style={styles.heroSub}>
                Explore curated designer fits, activewear &amp; premium accessories.
                Elevate your wardrobe — free shipping on your first order.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <Link to="/shop" className="hero-cta-primary">
                  Shop the Collection &nbsp;<i className="bi bi-arrow-right" />
                </Link>
                <a href="#categories" className="hero-cta-secondary">
                  Explore Categories
                </a>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[['12K+', 'Happy Customers'], ['500+', 'Products'], ['4.9★', 'Avg. Rating']].map(([num, lbl]) => (
                  <div key={lbl} style={styles.statPill}>
                    <span style={styles.statNum}>{num}</span>
                    <span style={styles.statLabel}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 1.5s 1s both',
            zIndex: 2,
          }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Scroll
            </span>
            <div style={{
              width: '22px',
              height: '36px',
              borderRadius: '11px',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '5px',
            }}>
              <div style={{
                width: '4px',
                height: '8px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.7)',
                animation: 'fadeUp 1.2s ease infinite',
              }} />
            </div>
          </div>
        </div>

        {/* ══════════════════════ FEATURE BAR ══════════════════════ */}
        <div style={styles.featureBar}>
          {FEATURES.map(({ icon, label, sub, color, bg }) => (
            <div key={label} className="feature-item-hover" style={styles.featureItem}>
              <div style={{ ...styles.featureIcon, background: bg, color }}>
                <i className={`bi ${icon}`} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════ CATEGORIES ══════════════════════ */}
        <section id="categories" style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={styles.sectionLabel}>Collections</div>
            <h2 style={styles.sectionTitle}>Shop by Category</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              Discover our curated selection across every style — from elevated everyday wear to statement pieces.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={idx}
                to={getCategoryLink(cat)}
                className="cat-card-hover text-decoration-none"
                style={styles.catCard}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ ...styles.catImg, height: cat.height }}
                />
                <div style={styles.catOverlay}>
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '100px',
                    padding: '2px 10px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    marginBottom: '6px',
                    alignSelf: 'flex-start',
                  }}>
                    {cat.tag}
                  </span>
                  <h5 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>{cat.name}</h5>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: '2px' }}>
                    Shop Now &nbsp;<i className="bi bi-arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════ FEATURED PRODUCTS ══════════════════════ */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={styles.sectionLabel}>Just In</div>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>New &amp; Trending</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0 }}>
                Fresh drops, curated daily from our latest arrivals.
              </p>
            </div>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'gap 0.2s',
              }}
            >
              View All Products &nbsp;<i className="bi bi-arrow-right" />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{
                width: '52px',
                height: '52px',
                border: '4px solid var(--border-glass)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="row g-4">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="col-lg-3 col-md-6 col-6">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-glass)',
            }}>
              <i className="bi bi-box-seam" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
              <h6 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No Products Yet</h6>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our catalog is being curated. Check back soon!</p>
            </div>
          )}
        </section>

        {/* ══════════════════════ PROMO BANNER ══════════════════════ */}
        <div style={styles.promoBanner}>
          <div style={styles.promoBg} />
          <div style={styles.promoOverlay} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <div className="promo-count-badge">
              <i className="bi bi-lightning-fill me-1" />
              Limited Time Offer
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Get 10% Off<br />Your First Order
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '480px', marginBottom: '2rem' }}>
              Sign up today and unlock your exclusive welcome discount. No minimum spend required.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register" className="hero-cta-primary">
                Create Free Account
              </Link>
              <Link to="/shop" className="hero-cta-secondary">
                Browse Collection
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={styles.sectionLabel}>Reviews</div>
            <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              Real experiences from thousands of happy shoppers worldwide.
            </p>
          </div>

          <div className="row g-4">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="testimonial-hover" style={styles.testimonialCard}>
                  <StarRating count={t.stars} />
                  <span style={styles.quoteIcon}>"</span>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    {t.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={t.avatar} alt={t.name} style={styles.avatar} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <i className="bi bi-patch-check-fill me-1" style={{ color: 'var(--primary)' }} />
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ══════════════════════ BRAND MARQUEE (full width) ══════════════════════ */}
      <div style={styles.marqueeOuter}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', justifyContent: 'center' }}>
          <span style={{
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
          }}>
            Trusted by top brands worldwide
          </span>
        </div>
        <div style={styles.marqueeTrack}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <React.Fragment key={i}>
              <span className="brand-item" style={styles.brandText}>{b}</span>
              <span style={{ color: 'var(--text-muted)', opacity: 0.3, alignSelf: 'center', fontSize: '1rem' }}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════ NEWSLETTER ══════════════════════ */}
      <div className="container-fluid px-3 px-md-4" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={styles.newsletterWrap}>
          {/* Decorative circles */}
          <div style={{ ...styles.newsletterCircle, width: '300px', height: '300px', top: '-80px', left: '-60px' }} />
          <div style={{ ...styles.newsletterCircle, width: '200px', height: '200px', bottom: '-40px', right: '10%' }} />
          <div style={{ ...styles.newsletterCircle, width: '150px', height: '150px', top: '40px', right: '25%' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '100px',
              padding: '5px 16px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#fff',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              <i className="bi bi-envelope-heart-fill" />
              Join 12,000+ Subscribers
            </div>

            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              Stay Ahead of the Trend
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
              Get early sale access, style inspiration and exclusive member-only offers delivered straight to your inbox.
            </p>

            {subscribed ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '100px',
                padding: '0.9rem 2rem',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
              }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#86efac' }} />
                You're subscribed — welcome to the club! 🎉
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  maxWidth: '500px',
                  margin: '0 auto',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </form>
            )}

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: '1rem', marginBottom: 0 }}>
              <i className="bi bi-shield-lock me-1" />
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
