'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuItem, Extra, Size } from '@/lib/types';
import { fetchMenu, formatPrice } from '@/lib/storage';
import BrandIcon from '@/components/BrandIcon';
import ThemeToggle from '@/components/ThemeToggle';
import { SearchIcon as SearchSvg, CartIcon as CartSvg, TrashIcon as TrashSvg } from '@/components/Icons';
import styles from './menu.module.css';
import Image from 'next/image';
import { memo } from 'react';

// Icons
const SearchIcon = () => <SearchSvg size={18} color="var(--text-muted)" />;
const PlusIcon = () => <span style={{ fontSize: '1.2rem', fontWeight: 300 }}>+</span>;
const MinusIcon = () => <span>−</span>;
const TrashIconComponent = () => <TrashSvg size={16} />;
const CartIconComponent = () => <CartSvg size={20} />;
const ArrowRightIcon = () => <span>→</span>;

// Main Page Component
function MenuContent() {
    const params = useParams();
    const router = useRouter();
    const tableId = params.table as string;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { items: cartItems, addItem, removeItem, updateQuantity, getTotals, getItemCount, isLoaded } = useCart();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Categories
    const categories = useMemo(() => {
        // defined order
        const order = ['Special Karahi & Handi', 'BBQ & Grill', 'Rice & Biryani', 'Tandoor (Breads)', 'Sides & Salads', 'Beverages', 'Desserts'];
        const availableCats = [...new Set(menuItems.map(item => item.categoryName))];
        return order.filter(c => availableCats.includes(c)).concat(availableCats.filter(c => !order.includes(c)));
    }, [menuItems]);

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const menu = await fetchMenu();
                console.log('Fetched menu items:', menu.length);
                if (menu.length === 0) {
                    setError('No menu items found. Please contact staff.');
                }
                setMenuItems(menu.length > 0 ? menu : []);
            } catch (err) {
                console.error('Failed to load menu:', err);
                setError('Failed to load menu. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        loadMenu();

        // Scroll listener for sticky header shadow
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = item.categoryName === activeCategory;
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [menuItems, activeCategory, searchQuery]);

    const handleAddToCart = (item: MenuItem) => {
        if (!item.isAvailable) return;

        if (item.sizes || (item.extras && item.extras.length > 0)) {
            setSelectedItem(item);
            setShowModal(true);
        } else {
            addItem(item);
        }
    };

    const handleCheckout = () => {
        router.push(`/customer/${tableId}/checkout`);
    };

    const scrollToCategory = (category: string) => {
        setActiveCategory(category);
        // Optional: scroll to section if we were doing single page list
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totals = getTotals();
    const itemCount = getItemCount();

    return (
        <div className={styles.menuPage} style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Elegant Sticky Header */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: isHeaderScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: isHeaderScrolled ? 'var(--shadow-sm)' : 'none'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'var(--accent-primary)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black',
                            boxShadow: 'var(--shadow-glow)'
                        }}>
                            <BrandIcon size={24} color="black" />
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                margin: 0,
                                lineHeight: 1.2,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                Abbottabad Eats
                            </h1>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                Table {tableId.length > 4 ? tableId.substring(0, 4) : tableId}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Sticky Horizontal Categories */}
                <div
                    ref={scrollContainerRef}
                    className="no-scrollbar"
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        padding: '0 1rem 1rem 1rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => scrollToCategory(category)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                background: activeCategory === category ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                                color: activeCategory === category ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                border: activeCategory === category ? 'none' : '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                cursor: 'pointer',
                                boxShadow: activeCategory === category ? 'var(--shadow-md)' : 'none',
                                transform: activeCategory === category ? 'translateY(-1px)' : 'none'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
                {/* Loading State */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <div className="animate-pulse" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading delicious menu...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        borderRadius: '16px',
                        marginBottom: '2rem'
                    }}>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-sm btn-secondary"
                            style={{ marginTop: '1rem' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {/* Search Bar - styled pill */}
                        <div style={{
                            position: 'relative',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder={`Search in ${activeCategory}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        {/* Menu Grid */}
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '1.5rem',
                                padding: '0 0.5rem'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                                    {activeCategory}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {filteredItems.length} items
                                </span>
                            </div>

                            <div className={styles.menuGrid}>
                                {filteredItems.map(item => (
                                    <MenuCard
                                        key={item.id}
                                        item={item}
                                        onAdd={handleAddToCart}
                                    />
                                ))}
                            </div>

                            {filteredItems.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '4rem 1rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <p style={{ fontSize: '1.1rem' }}>No items found in this category.</p>
                                    <button
                                        onClick={() => setActiveCategory(categories[0])}
                                        className="btn btn-link"
                                        style={{ marginTop: '1rem', color: 'var(--accent-primary)' }}
                                    >
                                        Browse all items
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Floating Cart & Bottom Sheet */}
            {itemCount > 0 && (
                <>
                    {/* Desktop/Tablet Floating Button */}
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        width: 'calc(100% - 2rem)',
                        maxWidth: '500px'
                    }}>
                        <button
                            onClick={() => setShowMobileCart(true)}
                            style={{
                                width: '100%',
                                background: 'var(--text-primary)', // High contrast black/dark
                                color: 'var(--bg-primary)',
                                padding: '1rem 1.5rem',
                                borderRadius: '100px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                            className="hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem'
                                }}>
                                    {itemCount}
                                </div>
                                <span>View Order</span>
                            </div>
                            <span>{formatPrice(totals.total)}</span>
                        </button>
                    </div>
                </>
            )}

            {/* Cart Sheet (Mobile/Desktop consistent) */}
            <CartSheet
                isOpen={showMobileCart}
                onClose={() => setShowMobileCart(false)}
                cartItems={cartItems}
                totals={totals}
                onCheckout={handleCheckout}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
            />

            {/* Customization Modal */}
            {showModal && selectedItem && (
                <ItemCustomizationModal
                    item={selectedItem}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedItem(null);
                    }}
                    onAdd={(size, extras, instructions) => {
                        addItem(selectedItem, 1, size, extras, instructions);
                        setShowModal(false);
                        setSelectedItem(null);
                    }}
                />
            )}
        </div>
    );
}

// Subcomponents

const MenuCard = memo(({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => {
    return (
        <div className={`${styles.menuCard} hover:scale-[1.02] hover:shadow-lg transition-all duration-300`}>
            <div className={styles.menuCardImage}>
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                />

                {/* Actions overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    pointerEvents: 'none'
                }} />

                {item.isPopular && (
                    <span className={styles.popularBadge}>
                        ★ Popular
                    </span>
                )}

                {!item.isAvailable && (
                    <div className={styles.soldOutOverlay}>
                        <span className={styles.soldOutBadge}>SOLD OUT</span>
                    </div>
                )}

                {/* Mobile Floating Add Button (Visible only on mobile via CSS) */}
                <button
                    className={styles.mobileAddBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(item);
                    }}
                    disabled={!item.isAvailable}
                    style={{ display: 'none' }} // Hidden by default, shown in media query
                >
                    +
                </button>
            </div>

            <div className={styles.menuCardBody}>
                <div className={styles.menuCardHeader}>
                    <h3 className={styles.menuCardName}>{item.name}</h3>
                    <span className={styles.menuCardPrice}>
                        {formatPrice(item.price)}
                    </span>
                </div>

                <p className={styles.menuCardDesc}>
                    {item.description}
                </p>

                <div className={styles.menuCardActions}>
                    <button
                        className={styles.addButton}
                        onClick={() => onAdd(item)}
                        disabled={!item.isAvailable}
                    >
                        {item.isAvailable ? (
                            <>Add <PlusIcon /></>
                        ) : (
                            'Unavailable'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});
MenuCard.displayName = 'MenuCard';

function CartSheet({ isOpen, onClose, cartItems, totals, onCheckout, onUpdateQuantity, onRemove }: any) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end', // for mobile bottom sheet effect
        }}>
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />
            <div className="cart-panel animate-slideUp" style={{
                position: 'relative',
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '600px',
                height: '90vh',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
                margin: '0 auto', // Center on desktop if needed, but flex-end aligns typically
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Your Order</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                            <CartIconComponent />
                            <p style={{ marginTop: '1rem' }}>Your cart is empty.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {cartItems.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        flexShrink: 0
                                    }}>
                                        <Image src={item.menuItem.image} alt="" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600 }}>{item.menuItem.name}</span>
                                            <span style={{ fontWeight: 600 }}>{formatPrice(item.menuItem.price * item.quantity)}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                            {item.selectedSize?.name} {item.selectedExtras.length > 0 && `+ ${item.selectedExtras.map((e: any) => e.name).join(', ')}`}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                padding: '2px'
                                            }}>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                >−</button>
                                                <span style={{ padding: '0 8px', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                >+</button>
                                            </div>

                                            <button
                                                onClick={() => onRemove(item.id)}
                                                style={{ color: 'var(--text-muted)', border: 'none', background: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <span>Subtotal</span>
                            <span>{formatPrice(totals.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                            <span>Total</span>
                            <span>{formatPrice(totals.total)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '1rem', justifyContent: 'center' }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ItemCustomizationModal({ item, onClose, onAdd }: {
    item: MenuItem;
    onClose: () => void;
    onAdd: (size?: Size, extras?: Extra[], instructions?: string) => void;
}) {
    const [selectedSize, setSelectedSize] = useState<Size | undefined>(item.sizes?.[0]);
    const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
    const [instructions, setInstructions] = useState('');

    const toggleExtra = (extra: Extra) => {
        if (selectedExtras.find(e => e.id === extra.id)) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const totalPrice = item.price + (selectedSize?.priceModifier || 0) + selectedExtras.reduce((sum: number, e: Extra) => sum + e.price, 0);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div className="animate-slideUp" style={{
                position: 'relative',
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '0', position: 'relative', height: '200px' }}>
                    <Image src={item.image} alt="" fill style={{ objectFit: 'cover' }} />
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >✕</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{item.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{item.description}</p>

                    {/* Size */}
                    {item.sizes && item.sizes.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Choose Size</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {item.sizes.map((size: Size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '12px',
                                            border: selectedSize?.id === size.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            background: selectedSize?.id === size.id ? 'var(--accent-primary-light)' : 'transparent',
                                            color: selectedSize?.id === size.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {size.name}
                                        {size.priceModifier !== 0 && ` (${size.priceModifier > 0 ? '+' : ''}${formatPrice(size.priceModifier)})`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {item.extras && item.extras.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Add Extras</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {item.extras.map((extra: Extra) => {
                                    const isSelected = !!selectedExtras.find(e => e.id === extra.id);
                                    return (
                                        <label key={extra.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
                                            cursor: 'pointer'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleExtra(extra)}
                                                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                                                />
                                                <span style={{ fontWeight: 500 }}>{extra.name}</span>
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)' }}>+{formatPrice(extra.price)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Special Instructions</h4>
                        <textarea
                            placeholder="Allergies? Less spicy?"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                fontFamily: 'inherit',
                                resize: 'none'
                            }}
                            rows={3}
                        />
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                    <button
                        onClick={() => onAdd(selectedSize, selectedExtras, instructions)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}
                    >
                        <span>Add to Order</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MenuPage() {
    const params = useParams();
    const tableId = params.table as string;

    return (
        <CartProvider tableNumber={tableId}>
            <MenuContent />
        </CartProvider>
    );
}
