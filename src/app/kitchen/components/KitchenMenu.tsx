'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem } from '@/lib/types';
import { fetchMenu, updateMenuItem, deleteMenuItem, createMenuItem, formatPrice, uploadImage } from '@/lib/storage';
import styles from '../kitchen.module.css';

export default function KitchenMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryName: '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' // default/placeholder
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadMenu = async () => {
            const menu = await fetchMenu();
            setMenuItems(menu);
        };
        loadMenu();
    }, []);

    const categories = useMemo(() => {
        return [...new Set(menuItems.map(item => item.categoryName))];
    }, [menuItems]);

    const filteredItems = activeCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.categoryName === activeCategory);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
        const success = await updateMenuItem(itemId, { isAvailable: !currentStatus });
        if (success) {
            setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, isAvailable: !currentStatus } : m));
        }
    };

    const handleDelete = async (item: MenuItem) => {
        if (confirm(`Delete ${item.name}? This will affect both Mobile & Web apps.`)) {
            const success = await deleteMenuItem(item.id);
            if (success) {
                setMenuItems(prev => prev.filter(m => m.id !== item.id));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(formData.price);
        if (isNaN(price)) return alert('Invalid price');

        setLoading(true);
        let finalImageUrl = formData.image;

        // Upload image if a new file is selected
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            setIsUploading(true);
            const uploadedUrl = await uploadImage(file, 'menu-items');
            setIsUploading(false);
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            } else {
                alert('Image upload failed, using default.');
            }
        }

        if (editingItem) {
            const success = await updateMenuItem(editingItem.id, { ...formData, price, image: finalImageUrl });
            if (success) {
                setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...formData, price, image: finalImageUrl } : m));
                setEditingItem(null);
            }
        } else {
            const newItem = await createMenuItem({
                ...formData,
                price,
                image: finalImageUrl,
                isAvailable: true,
                categoryId: formData.categoryName.toLowerCase().replace(/\s+/g, '-'),
                selectedExtras: []
            } as any);
            if (newItem) {
                setMenuItems(prev => [...prev, newItem]);
                setIsAdding(false);
            }
        }
        setFormData({ name: '', description: '', price: '', categoryName: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' });
        setPreviewUrl(null);
        setLoading(false);
    };

    // Minor fix for the loading state (I noticed I used setLoading which wasn't defined)
    const [loading, setLoading] = useState(false);

    return (
        <div className={styles.managementView}>
            <div className={styles.managementHeader}>
                <div className={styles.categoryPills}>
                    <button
                        className={`${styles.pill} ${activeCategory === 'all' ? styles.pillActive : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ name: '', description: '', price: '', categoryName: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' });
                    setPreviewUrl(null);
                    setIsAdding(true);
                }}>+ New Item</button>
            </div>

            <div className={styles.menuGrid}>
                {filteredItems.map(item => (
                    <div key={item.id} className={styles.menuItemCard}>
                        <div className={styles.itemImage} style={{ backgroundImage: `url(${item.image})` }}>
                            {!item.isAvailable && <div className={styles.soldOutOverlay}>SOLD OUT</div>}
                        </div>
                        <div className={styles.itemContent}>
                            <h3 className={styles.itemName}>{item.name}</h3>
                            <p className={styles.itemCategory}>{item.categoryName}</p>
                            <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                            <div className={styles.itemActions}>
                                <button className="btn btn-sm btn-secondary" onClick={() => {
                                    setEditingItem(item);
                                    setFormData({
                                        name: item.name,
                                        description: item.description,
                                        price: item.price.toString(),
                                        categoryName: item.categoryName,
                                        image: item.image
                                    });
                                    setPreviewUrl(item.image);
                                }}>Edit</button>
                                <button
                                    className={`btn btn-sm ${item.isAvailable ? 'btn-ghost' : 'btn-success'}`}
                                    onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                                >
                                    {item.isAvailable ? 'Disable' : 'Enable'}
                                </button>
                                <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item)}>Del</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(isAdding || editingItem) && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.imagePicker} onClick={() => fileInputRef.current?.click()}>
                                {previewUrl || formData.image ? (
                                    <div className={styles.previewImage} style={{ backgroundImage: `url(${previewUrl || formData.image})` }}>
                                        <div className={styles.imageOverlay}>Change Photo</div>
                                    </div>
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <span>Click to add photo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>

                            <input
                                placeholder="Item Name (e.g. Zinger Burger)"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Category (e.g. FAST food, Drinks)"
                                value={formData.categoryName}
                                onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <div className={styles.modalButtons}>
                                <button type="button" className="btn btn-secondary" onClick={() => { setIsAdding(false); setEditingItem(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading || isUploading}>
                                    {isUploading ? 'Uploading...' : (editingItem ? 'Save Changes' : 'Add Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
