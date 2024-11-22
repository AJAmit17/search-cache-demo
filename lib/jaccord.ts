export function getNGrams(text: string, n: number = 2): Set<string> {
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');
    const ngrams = new Set<string>();

    const words = normalized.split(/\s+/);
    words.forEach(word => ngrams.add(word));

    for (let i = 0; i <= words.length - n; i++) {
        ngrams.add(words.slice(i, i + n).join(' '));
    }

    for (let i = 0; i <= normalized.length - n; i++) {
        ngrams.add(normalized.slice(i, i + n));
    }
    
    return ngrams;
}

export function calculateJaccardSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    if (str1.toLowerCase() === str2.toLowerCase()) return 1.0;
    
    const normalized1 = str1.toLowerCase();
    const normalized2 = str2.toLowerCase();
    
    const lengthPenalty = Math.min(normalized2.length / 3, 1);
    
    if (normalized1.includes(normalized2)) {
        const position = normalized1.indexOf(normalized2);
        const positionScore = 1 - (position / normalized1.length);
        return Math.min(0.7 + (positionScore * 0.3), 1) * lengthPenalty;
    }
    
    const set1 = getNGrams(str1);
    const set2 = getNGrams(str2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    let similarity = intersection.size / union.size;

    similarity = Math.pow(similarity, 0.7) * lengthPenalty;
    
    return Math.min(similarity, 1);
}