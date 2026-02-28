import * as FileSystem from 'expo-file-system';
import type { ParsedResume } from '../types';

// Common tech skill keywords to scan for
const SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'c++', 'c#',
    'react', 'react native', 'vue', 'angular', 'next.js', 'node.js', 'express',
    'django', 'flask', 'spring', 'flutter', 'android', 'ios',
    'sql', 'postgresql', 'mysql', 'mongodb', 'firebase', 'supabase', 'redis',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'git', 'github',
    'figma', 'photoshop', 'illustrator', 'xd',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
    'data analysis', 'pandas', 'numpy', 'tableau', 'power bi',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'graphql', 'rest api', 'microservices',
    'agile', 'scrum', 'jira',
];

/**
 * Extract a name heuristic: look for "Name:" prefix or take the first
 * non-empty, non-email, non-phone line that looks like a personal name.
 */
function extractName(lines: string[]): string {
    // Look for explicit "Name: John Doe"
    for (const line of lines) {
        const nameMatch = line.match(/^name\s*[:\-]\s*(.+)/i);
        if (nameMatch) return nameMatch[1].trim();
    }
    // Heuristic: first non-empty line with 2-4 words, only letters and spaces
    for (const line of lines.slice(0, 10)) {
        const trimmed = line.trim();
        if (
            trimmed.length > 2 &&
            trimmed.length < 60 &&
            /^[A-Za-z .'-]{2,}$/.test(trimmed) &&
            trimmed.split(' ').length >= 2 &&
            trimmed.split(' ').length <= 5
        ) {
            return trimmed;
        }
    }
    return '';
}

/**
 * Extract email addresses using regex.
 */
function extractEmail(text: string): string {
    const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : '';
}

/**
 * Find matching skills from the text (case-insensitive).
 */
function extractSkills(text: string): string[] {
    const lower = text.toLowerCase();
    const found: string[] = [];
    for (const skill of SKILL_KEYWORDS) {
        if (lower.includes(skill)) {
            // Capitalize nicely
            found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    }
    // Deduplicate
    return [...new Set(found)];
}

/**
 * Parse a resume file (PDF/DOC) from its local URI.
 * Reads raw bytes as Base64 string and converts to text for regex parsing.
 * NOTE: This is a best-effort text extraction — works well for text-layer PDFs
 * and plain-text .txt files. For complex PDFs, the user should correct fields.
 */
export async function parseResumeFromUri(uri: string): Promise<ParsedResume> {
    try {
        // Read file as a string (base64 or UTF-8 for text files)
        let rawText = '';
        try {
            // Try reading as UTF-8 plain text first (works for txt, some docs)
            rawText = await FileSystem.readAsStringAsync(uri, {
                encoding: 'utf8' as any,
            });
        } catch {
            // Fallback: read as base64 and decode printable ASCII chars
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64' as any,
            });
            // Decode base64 → binary string → extract printable text runs
            const binaryStr = atob(base64);
            const printable: string[] = [];
            let run = '';
            for (let i = 0; i < binaryStr.length; i++) {
                const code = binaryStr.charCodeAt(i);
                if (code >= 32 && code <= 126) {
                    run += binaryStr[i];
                } else if (code === 10 || code === 13) {
                    if (run.trim().length > 3) printable.push(run.trim());
                    run = '';
                } else {
                    if (run.trim().length > 3) printable.push(run.trim());
                    run = '';
                }
            }
            if (run.trim().length > 3) printable.push(run.trim());
            rawText = printable.join('\n');
        }

        const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);

        const name = extractName(lines);
        const email = extractEmail(rawText);
        const skills = extractSkills(rawText);

        return { name, email, skills, rawText: lines.join('\n') };
    } catch {
        return { name: '', email: '', skills: [], rawText: '' };
    }
}
