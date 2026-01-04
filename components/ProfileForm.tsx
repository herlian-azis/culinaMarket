'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { User, Phone, Save } from 'lucide-react';

export default function ProfileForm() {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, phone_number')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFullName(data.full_name || '');
                setPhoneNumber(data.phone_number || '');
            } else if (error && error.code === 'PGRST116') {
                // Profile missing, create it
                console.log('Profile missing, creating...');
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert({ id: user?.id, full_name: user?.user_metadata?.full_name || '' });

                if (createError) console.error('Error creating profile:', createError);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            addToast('Failed to load profile', 'error');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    full_name: fullName,
                    phone_number: phoneNumber,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            addToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-6">

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all placeholder:text-gray-400"
                        placeholder="John Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 outline-none transition-all placeholder:text-gray-400"
                        placeholder="+62 812..."
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    );
}
