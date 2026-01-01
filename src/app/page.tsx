'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchMenu } from '@/lib/storage';
import { MenuItem } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';
import BrandIcon from '@/components/BrandIcon';
import { MapPinIcon, ClockIcon, PhoneIcon } from '@/components/Icons';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedItems = async () => {
      const menuItems = await fetchMenu();
      const popular = menuItems.filter(item => item.isPopular).slice(0, 4);
      setFeaturedItems(popular);
      setLoading(false);
    };
    loadFeaturedItems();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 50%, #f0f0f0 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <header style={{
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <BrandIcon size={24} />
          </div>
          <span style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            Abbottabad Eats
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
          <a href="#about" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }}>About</a>
          <a href="#menu" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }}>Menu</a>
          <a href="#contact" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: 500 }}>Contact</a>
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: 'var(--space-12) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: theme === 'dark'
          ? 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80") center/cover no-repeat'
          : 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.9)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80") center/cover no-repeat'
      }}>
        <div style={{
          maxWidth: '800px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--accent-primary-light)',
            border: '1px solid var(--accent-primary-border)',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--space-2) var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--accent-primary)',
            fontWeight: 600
          }}>
            Authentic Pakistani & Fusion Cuisine
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)'
          }}>
            Taste the
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>Perfect Fusion</span>
          </h1>

          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            maxWidth: '600px',
            margin: '0 auto var(--space-8)'
          }}>
            Welcome to Abbottabad Eats – where traditional Pakistani flavors meet modern culinary artistry. Dine in, order via QR, and enjoy a seamless, contactless experience.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#menu" className="btn btn-primary btn-lg" style={{ color: '#fff' }}>
              View Our Menu
            </a>
            <a href="#contact" className="btn btn-secondary btn-lg">
              Reserve a Table
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: 'var(--space-12) var(--space-6)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-4)', color: 'var(--accent-primary)', fontWeight: 700 }}>About Abbottabad Eats</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
              Founded in the heart of Abbottabad, Abbottabad Eats brings together the rich heritage of Pakistani cuisine with a modern, tech-forward dining experience.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
              Our chefs use only the freshest local ingredients to craft dishes that honor tradition while embracing innovation. From sizzling Biryanis to fusion appetizers, every plate tells a story.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              At your table, simply scan the QR code with your phone to browse our menu, customize your order, and pay – all without waiting for a server!
            </p>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-6)',
            border: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '700', color: 'var(--accent-primary)' }}>50+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Menu Items</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '700', color: 'var(--accent-primary)' }}>15</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Tables</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '700', color: 'var(--accent-primary)' }}>5★</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Avg. Rating</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '700', color: 'var(--accent-primary)' }}>24/7</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Online Orders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section id="menu" style={{
        padding: 'var(--space-12) var(--space-6)',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)', fontWeight: 700 }}>
              Featured <span style={{ color: 'var(--accent-primary)' }}>Dishes</span>
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Our most loved creations, handpicked for you</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {featuredItems.length > 0 ? featuredItems.map(item => (
              <div key={item.id} className="card" style={{
                overflow: 'hidden',
                padding: 0
              }}>
                <div style={{
                  height: '180px',
                  background: `url(${item.image}) center/cover no-repeat`,
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: 'var(--space-3)',
                    right: 'var(--space-3)',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600'
                  }}>
                    Popular
                  </span>
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', lineHeight: '1.5' }}>
                    {item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: 'var(--font-size-lg)' }}>Rs. {item.price}</span>
                    <span className="badge badge-secondary">{item.categoryName}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>Loading featured items...</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact / Location Section */}
      <section id="contact" style={{
        padding: 'var(--space-12) var(--space-6)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-6)', fontWeight: 700 }}>
            Visit <span style={{ color: 'var(--accent-primary)' }}>Us</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}>
            <div className="card">
              <div style={{ marginBottom: 'var(--space-3)', color: 'var(--accent-primary)' }}><MapPinIcon size={28} /></div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontWeight: 600 }}>Location</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Main Boulevard, Abbottabad, Pakistan</p>
            </div>
            <div className="card">
              <div style={{ marginBottom: 'var(--space-3)', color: 'var(--accent-primary)' }}><ClockIcon size={28} /></div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontWeight: 600 }}>Hours</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Daily: 12:00 PM – 11:00 PM</p>
            </div>
            <div className="card">
              <div style={{ marginBottom: 'var(--space-3)', color: 'var(--accent-primary)' }}><PhoneIcon size={28} /></div>
              <h4 style={{ marginBottom: 'var(--space-2)', fontWeight: 600 }}>Contact</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>+92 300 1234567</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Walk in anytime or call ahead for large party reservations. We can't wait to serve you!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: 'var(--space-6)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-size-sm)',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <p>© 2024 Abbottabad Eats. Crafted in Abbottabad.</p>
      </footer>
    </div>
  );
}
