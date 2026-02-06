import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export const SERVERS = [
    { id: 'S1', url: 'https://storage-s1.onrender.com' },
    { id: 'S2', url: 'https://storage-s2.onrender.com' },
    { id: 'S3', url: 'https://storage-s3.onrender.com' },
    { id: 'S4', url: 'https://storage-s4.onrender.com' },
    { id: 'S5', url: 'https://storage-s5.onrender.com' },
];

export const apiClient = {
    async getStatus(serverUrl) {
        try {
            const resp = await axios.get(`${serverUrl}/status`, { timeout: 2000 });
            return { ...resp.data, online: true };
        } catch (err) {
            return { online: false };
        }
    },

    async getHashes(serverUrl) {
        const resp = await axios.get(`${serverUrl}/hashes`);
        return resp.data;
    },

    async uploadFile(serverUrl, file) {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await axios.post(`${serverUrl}/upload`, formData);
        return resp.data;
    },

    async downloadFile(serverUrl, masterHash) {
        const resp = await axios.post(`${serverUrl}/download`,
            { master_hash: masterHash },
            { responseType: 'blob' }
        );
        return resp.data;
    },

    async simulateAttack() {
        // S3 is fixed as the attack target in requirements
        const s3 = SERVERS.find(s => s.id === 'S3');
        const resp = await axios.post(`${s3.url}/attack`);
        return resp.data;
    },

    async fetchLogs() {
        if (!supabase) {
            console.warn("Supabase client not initialized. Check your environment variables.");
            return [];
        }
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .order('time', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    }
};
