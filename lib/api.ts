const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'shloksagar_admin_secret_key_2025';

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const headers = {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}/admin${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMsg = error.message || error.error || `API request failed: ${response.status} ${response.statusText}`;
        console.error('API Error:', {
            endpoint: `${API_URL}/admin${endpoint}`,
            status: response.status,
            statusText: response.statusText,
            error
        });
        throw new Error(errorMsg);
    }

    return response.json();
}

export const adminApi = {
    // ═══ ANALYTICS ═══
    getDashboard: (filter: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams({ filter });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return adminFetch(`/analytics/dashboard?${params}`);
    },

    // ═══ CATEGORIES ═══
    getCategories: (includeHidden = false) => adminFetch(`/categories${includeHidden ? '?all=true' : ''}`),
    createCategory: (data: any) => adminFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: string, data: any) => adminFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id: string) => adminFetch(`/categories/${id}`, { method: 'DELETE' }),

    // Content
    getAllContent: (params?: any) => {
        const query = new URLSearchParams(params).toString();
        return adminFetch(`/content?${query}`);
    },
    createContent: (data: any) => adminFetch('/content', { method: 'POST', body: JSON.stringify(data) }),
    updateContent: (id: string, data: any) => adminFetch(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteContent: (id: string) => adminFetch(`/content/${id}`, { method: 'DELETE' }),

    // Festivals
    getFestivals: () => adminFetch('/festivals'),
    createFestival: (data: any) => adminFetch('/festivals', { method: 'POST', body: JSON.stringify(data) }),
    updateFestival: (id: string, data: any) => adminFetch(`/festivals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteFestival: (id: string) => adminFetch(`/festivals/${id}`, { method: 'DELETE' }),

    // Gita Sandesh
    getGitaSandesh: () => adminFetch('/gita-sandesh'),
    createGitaSandesh: (data: any) => adminFetch('/gita-sandesh', { method: 'POST', body: JSON.stringify(data) }),
    updateGitaSandesh: (id: string, data: any) => adminFetch(`/gita-sandesh/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGitaSandesh: (id: string) => adminFetch(`/gita-sandesh/${id}`, { method: 'DELETE' }),

    // Gita Shlok
    getGitaShlok: (chapter?: number) => {
        const params = chapter ? `?chapter=${chapter}` : '';
        return adminFetch(`/gita-shlok${params}`);
    },
    createGitaShlok: (data: any) => adminFetch('/gita-shlok', { method: 'POST', body: JSON.stringify(data) }),
    updateGitaShlok: (id: string, data: any) => adminFetch(`/gita-shlok/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGitaShlok: (id: string) => adminFetch(`/gita-shlok/${id}`, { method: 'DELETE' }),

    // Quotes
    getQuotes: () => adminFetch('/quotes'),
    createQuote: (data: any) => adminFetch('/quotes', { method: 'POST', body: JSON.stringify(data) }),
    updateQuote: (id: string, data: any) => adminFetch(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteQuote: (id: string) => adminFetch(`/quotes/${id}`, { method: 'DELETE' }),

    // Wallpapers
    getWallpapers: () => adminFetch('/wallpapers'),
    createWallpaper: (data: any) => adminFetch('/wallpapers', { method: 'POST', body: JSON.stringify(data) }),
    updateWallpaper: (id: string, data: any) => adminFetch(`/wallpapers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWallpaper: (id: string) => adminFetch(`/wallpapers/${id}`, { method: 'DELETE' }),

    // Videos
    getVideos: () => adminFetch('/videos'),
    createVideo: (data: any) => adminFetch('/videos', { method: 'POST', body: JSON.stringify(data) }),
    updateVideo: (id: string, data: any) => adminFetch(`/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteVideo: (id: string) => adminFetch(`/videos/${id}`, { method: 'DELETE' }),

    // ═══ ADS ═══
    getAdPackages: () => adminFetch('/ads/packages'),
    getAds: () => adminFetch('/ads'),
    getAdById: (id: string) => adminFetch(`/ads/${id}`),
    createAd: (data: any) => adminFetch('/ads', { method: 'POST', body: JSON.stringify(data) }),
    updateAdStatus: (id: string, status: 'active' | 'paused') =>
        adminFetch(`/ads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getAdPerformance: (id: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return adminFetch(`/ads/${id}/performance?${params}`);
    },
    getAdsOverview: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return adminFetch(`/ads/performance/overview?${params}`);
    },

    // ═══ CONTACT MESSAGES ═══
    getContactMessages: () => adminFetch('/contact-messages'),
    updateContactMessageStatus: (id: string, status: string, adminNotes?: string) =>
        adminFetch(`/contact-messages/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, adminNotes }),
        }),
};

// Media API
export const mediaApi = {
    getCloudinarySignature: () => adminFetch('/media/signature'),
};
