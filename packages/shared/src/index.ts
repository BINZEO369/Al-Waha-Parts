export type Environment = 'development' | 'staging' | 'production';
export interface ApiHealth { status: 'ok'; service: 'al-waha-parts-api'; environment: Environment | string; timestamp: string; }
export interface ApiResponse<T> { data: T; requestId?: string; }
export interface PartSummary { id: string; sku: string; name: string; status: 'draft' | 'active' | 'archived'; }
