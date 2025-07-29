import { getDatabase } from '../firebase/admin';
import { cache } from 'react';

export const getSubcategoriesFromDB = cache(async () => {
    const realtimeDb = getDatabase(); // ✅ Realtime DB

    const snapshot = await realtimeDb.ref('subCategories').once('value');
    const raw = snapshot.val();
    // Convert to { [category]: string[] }
    const parsed: Record<string, string[]> = {};
    for (const [category, csv] of Object.entries(raw)) {
        parsed[category] = (csv as string).split(',').map((s) => s.trim());
    }

    return parsed;
});
