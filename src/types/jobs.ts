
export type SortOrder= 'asc' | 'desc';

export type Job = {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: number | null;
    description: string;
    owner_id: number;
}

export type CreateJobInput={
    title: string;
    company: string;
    location: string;
    salary?: number;
    description: string;
}

export type UpdateJobInput={
    title?: string;
    company?: string;
    location?: string;
    salary?: number;
    description?: string;
}