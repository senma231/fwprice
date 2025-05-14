
export interface RfqSubmission {
  id: string; // Internal DB ID
  submissionId: string; // User-facing ID (e.g., RFQ-169...)
  name: string;
  email: string;
  company?: string;
  origin: string;
  destination: string;
  weight?: number;
  freightType?: 'sea' | 'air' | 'land' | '';
  message?: string;
  submittedAt: Date;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed'; // Example statuses
}
