// ─── User ──────────────────────────────────────────────
export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    skills: string[];
    github: string;
    linkedin: string;
    createdAt: string;
}

// ─── Internship (Remotive API shape) ───────────────────
export interface RemotiveJob {
    id: number;
    url: string;
    title: string;
    company_name: string;
    company_logo: string | null;
    category: string;
    tags: string[];
    job_type: string;
    publication_date: string;
    candidate_required_location: string;
    salary: string;
    description: string;
    company_logo_url: string | null;
}

export interface RemotiveResponse {
    'job-count': number;
    jobs: RemotiveJob[];
}

// ─── Internship (App-level normalised shape) ───────────
export interface Internship {
    id: number;
    title: string;
    company: string;
    companyLogo: string | null;
    category: string;
    tags: string[];
    jobType: string;
    publishedAt: string;
    location: string;
    salary: string;
    description: string;
    url: string;
}

// ─── Saved Internship ──────────────────────────────────
export interface SavedInternship {
    id: string;
    internship: Internship;
    savedAt: string;
}

// ─── Application ───────────────────────────────────────
export type ApplicationStatus = 'Applied' | 'Interview' | 'Rejected' | 'Selected';

export interface Application {
    id: string;
    internshipId: number;
    internship: Internship;
    status: ApplicationStatus;
    appliedAt: string;
}

// ─── Categories ────────────────────────────────────────
export const CATEGORIES: string[] = [
    'Software Development',
    'Design',
    'Marketing',
    'Customer Support',
    'Sales',
    'Product',
    'Data',
    'DevOps / Sysadmin',
    'Finance / Legal',
    'Human Resources',
    'QA',
    'Writing',
    'All others',
];
