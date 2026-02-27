import apiClient from './client';
import type { RemotiveResponse, Internship } from '../types';

/**
 * Map raw Remotive API shape → app-level Internship shape.
 */
function normalise(raw: RemotiveResponse['jobs'][number]): Internship {
    return {
        id: raw.id,
        title: raw.title,
        company: raw.company_name,
        companyLogo: raw.company_logo_url ?? raw.company_logo,
        category: raw.category,
        tags: raw.tags ?? [],
        jobType: raw.job_type,
        publishedAt: raw.publication_date,
        location: raw.candidate_required_location || 'Remote',
        salary: raw.salary || 'Not specified',
        description: raw.description,
        url: raw.url,
    };
}

export interface FetchParams {
    category?: string;
    search?: string;
    limit?: number;
}

/**
 * Fetch internships from the Remotive API.
 * Note: The free API returns all jobs at once; we slice client-side for pagination.
 */
export async function fetchRemotiveJobs(
    params: FetchParams = {},
): Promise<Internship[]> {
    const queryParams: Record<string, string> = {};

    if (params.category && params.category !== 'All') {
        queryParams.category = params.category.toLowerCase().replace(/ /g, '-');
    }
    if (params.search) {
        queryParams.search = params.search;
    }
    if (params.limit) {
        queryParams.limit = String(params.limit);
    }

    const { data } = await apiClient.get<RemotiveResponse>('/remote-jobs', {
        params: queryParams,
    });

    return data.jobs.map(normalise);
}
