// ─── User Roles ────────────────────────────────────────
export type UserRole = 'intern' | 'employer';

// ─── User ──────────────────────────────────────────────
export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    skills: string[];
    github: string;
    linkedin: string;
    bio: string;
    resumeUri?: string;
    resumeName?: string;
    createdAt: string;
    // Employer-only fields
    companyName?: string;
    companyWebsite?: string;
    companyAbout?: string;
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
    id: number | string;
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
    source: 'api' | 'inapp'; // NEW: origin of the internship
    postedBy?: string; // uid of employer if source === 'inapp'
}

// ─── Employer-posted Internship ───────────────────────
export interface InternshipPost {
    id: string;
    title: string;
    company: string;
    category: string;
    jobType: string;
    location: string;
    salary: string;
    description: string;
    deadline: string;
    postedBy: string; // employer uid
    postedAt: string;
    applicantCount: number;
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
    internshipId: number | string;
    internship: Internship;
    status: ApplicationStatus;
    appliedAt: string;
    // Resume / applicant details
    applicantName: string;
    applicantEmail: string;
    coverNote: string;
    resumeUri?: string;
    resumeName?: string;
    resumeParsedText?: string;
    parsedSkills?: string[];
}

// ─── Parsed Resume ─────────────────────────────────────
export interface ParsedResume {
    name: string;
    email: string;
    skills: string[];
    rawText: string;
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

export const JOB_TYPES: string[] = [
    'Full-time',
    'Part-time',
    'Internship',
    'Contract',
    'Freelance',
];
