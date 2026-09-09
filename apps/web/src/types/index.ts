export interface User {
  id: string;
  email: string;
  full_name: string;
  organization_id?: string;
  organization_name?: string;
  role?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
  is_demo?: boolean;
}

export interface BusinessProfile {
  id?: string;
  organization_id?: string;
  company_name: string;
  industry?: string;
  sub_industry?: string;
  country?: string;
  state?: string;
  city?: string;
  company_size?: string;
  revenue_range?: string;
  description?: string;
  website?: string;
  linkedin?: string;
  founded_year?: string;
  capabilities?: string[] | string;
  certifications?: string[] | string;
  registrations?: string[] | string;
  preferred_contract_min?: number | string;
  preferred_contract_max?: number | string;
  preferred_currency?: string;
  funding_required?: boolean;
  export_focused?: boolean;
  onboarding_completed?: boolean;
}

export type OpportunityType = 
  | 'tender'
  | 'rfp'
  | 'rfq'
  | 'eoi'
  | 'grant'
  | 'scheme'
  | 'subsidy'
  | 'accelerator'
  | 'incubator'
  | 'challenge'
  | 'partnership'
  | 'export'
  | 'research'
  | 'corporate_rfp'
  | 'procurement'
  | 'innovation'
  | 'vendor_registration';

export type OpportunityCategory = 
  | 'government'
  | 'funding'
  | 'corporate'
  | 'global'
  | 'startup'
  | 'innovation'
  | 'partnership';

export type VerificationStatus = 'verified' | 'unverified' | 'needs_review' | 'expired';

export type Recommendation = 'pursue' | 'review' | 'partner' | 'watch' | 'skip';

export interface OpportunityScore {
  id?: string;
  opportunity_id?: string;
  organization_id?: string;
  overall_score: number;
  eligibility_score?: number;
  business_fit_score?: number;
  capability_fit_score?: number;
  geographic_fit_score?: number;
  value_fit_score?: number;
  time_feasibility_score?: number;
  competition_score?: number;
  execution_fit_score?: number;
  recommendation?: Recommendation | string;
  recommendation_reason?: string;
  score_metadata?: any;
  is_ai_generated?: boolean;
}

export interface Opportunity {
  id: string;
  external_id?: string;
  title: string;
  description?: string;
  opportunity_type?: OpportunityType | string;
  category?: OpportunityCategory | string;
  sub_category?: string;
  organization_name?: string;
  organization_type?: string;
  geography_country?: string;
  geography_state?: string;
  geography_city?: string;
  is_international?: boolean;
  currency?: string;
  value_min?: number;
  value_max?: number;
  value_display?: string;
  deadline?: string;
  published_at?: string;
  last_updated?: string;
  source_url?: string;
  is_verified?: boolean;
  verification_status?: VerificationStatus | string;
  is_expired?: boolean;
  is_demo?: boolean;
  requirements?: string[] | any;
  eligibility_criteria?: string[] | any;
  required_documents?: string[] | any;
  evaluation_criteria?: string[] | any;
  tags?: string[];
  industry_tags?: string[];
  technology_tags?: string[];
  view_count?: number;
  save_count?: number;
  score?: OpportunityScore;
  created_at: string;
  updated_at?: string;
}

export type ApplicationStatus = 'draft' | 'in_progress' | 'review' | 'submitted' | 'won' | 'lost' | 'withdrawn';

export interface Application {
  id: string;
  organization_id?: string;
  opportunity_id?: string;
  title: string;
  status: ApplicationStatus | string;
  assigned_to?: string;
  deadline?: string;
  submission_date?: string;
  outcome?: string;
  outcome_value?: number;
  outcome_notes?: string;
  created_at: string;
  updated_at?: string;
}

export type NotificationType = 'new_match' | 'deadline' | 'update' | 'score_change' | 'partner' | 'funding' | 'match' | 'alert';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id?: string;
  organization_id?: string;
  type: NotificationType | string;
  title: string;
  body?: string;
  message?: string;
  opportunity_id?: string;
  is_read: boolean;
  priority?: NotificationPriority | string;
  created_at: string;
}

export interface ConversationMessage {
  id?: string;
  role: 'user' | 'ai' | 'assistant';
  content: string;
  timestamp?: string;
  created_at?: string;
}

export interface AIConversation {
  id: string;
  user_id?: string;
  organization_id?: string;
  title: string;
  messages: ConversationMessage[];
  context_opportunity_ids?: string[];
  created_at: string;
  updated_at?: string;
}

export interface AnalyticsOverview {
  opportunities_discovered: number;
  opportunities_matched: number;
  opportunities_pursued: number;
  opportunities_submitted: number;
  opportunities_won: number;
  estimated_pipeline_value: number;
  realized_value: number;
  win_rate: number;
  average_match_score: number;
  new_matches_this_week: number;
  deadlines_this_week: number;
  high_priority_count: number;
  saved_count: number;
}

export interface OpportunityFilters {
  category?: OpportunityCategory | string;
  opportunity_type?: OpportunityType | string;
  search?: string;
  geography_country?: string;
  value_min?: number;
  value_max?: number;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AuthResult {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}
