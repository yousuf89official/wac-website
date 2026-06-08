export interface SeoCheck {
    status: 'pass' | 'warn' | 'fail';
    message: string;
}

export interface SeoScoreResult {
    score: number;
    checks: SeoCheck[];
}

export const calculateSeoScore = (
    title: string,
    description: string,
    content: string,
    keyword: string
): SeoScoreResult => {
    let score = 100;
    const checks: SeoCheck[] = [];

    // 1. Title Checks
    if (!title) {
        score -= 20;
        checks.push({ status: 'fail', message: 'Missing meta title.' });
    } else if (title.length < 30) {
        score -= 10;
        checks.push({ status: 'warn', message: 'Title is too short (min 30 chars).' });
    } else if (title.length > 60) {
        score -= 10;
        checks.push({ status: 'warn', message: 'Title is too long (max 60 chars).' });
    } else {
        checks.push({ status: 'pass', message: 'Title length is optimal.' });
    }

    // 2. Description Checks
    if (!description) {
        score -= 20;
        checks.push({ status: 'fail', message: 'Missing meta description.' });
    } else if (description.length < 120) {
        score -= 10;
        checks.push({ status: 'warn', message: 'Description is too short (min 120 chars).' });
    } else if (description.length > 160) {
        score -= 5;
        checks.push({ status: 'warn', message: 'Description is too long (max 160 chars).' });
    } else {
        checks.push({ status: 'pass', message: 'Description length is optimal.' });
    }

    // 3. Keyword Checks
    if (keyword) {
        const keywordLower = keyword.toLowerCase();
        if (!title.toLowerCase().includes(keywordLower)) {
            score -= 10;
            checks.push({ status: 'warn', message: 'Focus keyword not in title.' });
        } else {
            checks.push({ status: 'pass', message: 'Focus keyword present in title.' });
        }

        if (!description.toLowerCase().includes(keywordLower)) {
            score -= 10;
            checks.push({ status: 'warn', message: 'Focus keyword not in description.' });
        } else {
            checks.push({ status: 'pass', message: 'Focus keyword present in description.' });
        }
    } else {
        score -= 10;
        checks.push({ status: 'warn', message: 'No focus keyword set.' });
    }

    // 4. Content Checks
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 300) {
        score -= 10;
        checks.push({ status: 'warn', message: `Content is thin (${wordCount} words). Aim for 300+.` });
    } else {
        checks.push({ status: 'pass', message: 'Content length is sufficient.' });
    }

    return { score: Math.max(0, score), checks };
};
