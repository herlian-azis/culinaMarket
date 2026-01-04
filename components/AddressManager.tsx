'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Plus, Trash2, Edit2, Star, Check, ChevronDown, AlertTriangle } from 'lucide-react';

type Address = {
    id: string;
    label: string;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
};

export default function AddressManager() {
    const { addToast } = useToast();
    const { user, session } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        label: 'Home',
        recipient_name: '',
        phone_number: '',
        address_line: '',
        city: '',
        postal_code: '',
        is_default: false
    });

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            if (!user || !session) return;

            const res = await fetch(`/api/addresses?user_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);
            setAddresses(data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!session) throw new Error('No session');

            const payload = { ...formData };
            let res;
            let verb = 'created';

            if (editingAddress) {
                verb = 'updated';
                res = await fetch(`/api/addresses/${editingAddress.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/addresses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            addToast(`Address successfully ${verb}`, 'success');
            setShowModal(false);
            setEditingAddress(null);
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            const message = error instanceof Error ? error.message : 'Failed to save address';
            addToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmationId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmationId || !session) return;

        try {
            const res = await fetch(`/api/addresses/${deleteConfirmationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            addToast('Address deleted successfully', 'success');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete address';
            addToast(message, 'error');
        } finally {
            setDeleteConfirmationId(null);
        }
    };

    const openForEdit = (addr: Address) => {
        setEditingAddress(addr);
        setFormData({
            label: addr.label,
            recipient_name: addr.recipient_name,
            phone_number: addr.phone_number,
            address_line: addr.address_line,
            city: addr.city,
            postal_code: addr.postal_code,
            is_default: addr.is_default
        });
        setShowModal(true);
    };

    const openForNew = () => {
        setEditingAddress(null);
        setFormData({
            label: 'Home',
            recipient_name: '',
            phone_number: '',
            address_line: '',
            city: '',
            postal_code: '',
            is_default: addresses.length === 0 // Default true if first address
        });
        setShowModal(true);
    };

    const handleSetDefault = async (id: string) => {
        if (!session) return;
        try {
            // We use the PUT endpoint with is_default: true. 
            // The API handles unsetting others.
            const res = await fetch(`/api/addresses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ is_default: true })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            addToast('Default address updated', 'success');
            fetchAddresses();
        } catch (error: unknown) {
            console.error('Error setting default:', error);
            const message = error instanceof Error ? error.message : 'Failed to set default address';
            addToast(message, 'error');
        }
    };

    if (loading) return <div className="text-center py-8">Loading addresses...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                <Button onClick={openForNew} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Address
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className={`p-4 rounded-xl border ${addr.is_default ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white'} relative group`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant={addr.label === 'Home' ? 'brand' : 'outline'} className="capitalize">
                                    {addr.label}
                                </Badge>
                                {addr.is_default && (
                                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Default
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!addr.is_default && (
                                    <button onClick={() => handleSetDefault(addr.id)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg" title="Set as Default">
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => openForEdit(addr)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteClick(addr.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="font-semibold text-gray-900">{addr.recipient_name}</p>
                        <p className="text-sm text-gray-600">{addr.phone_number}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {addr.address_line}, {addr.city} {addr.postal_code}
                        </p>
                    </div>
                ))}

                {addresses.length === 0 && !loading && (
                    <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No addresses saved yet</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">{editingAddress ? 'Edit Address' : 'New Address'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                                    <div className="relative">
                                        <select
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            className="w-full p-2 pr-10 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all appearance-none"
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700">Set as Default</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.recipient_name}
                                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Address</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.address_line}
                                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all"
                                    placeholder="Jl. Sudirman No. 25..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Address'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Address?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Are you sure you want to remove this address? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setDeleteConfirmationId(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
