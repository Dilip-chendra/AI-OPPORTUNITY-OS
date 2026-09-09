// ============================================================
// AI Opportunity OS — Shared TypeScript Types
// Used by both frontend and any future SDK
// ============================================================

// ── Base ────────────────────────────────────────────────────

export interface TimestampedEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ── API Responses ────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
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

export interface ApiError {
  detail: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

// ── Auth ─────────────────────────────────────────────────────

export interface User extends TimestampedEntity {
  email: string;
  full_name: string;
  organization_id: string;
  organization_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  is_admin: boolean;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  is_authenticated: boolean;
  is_loading: boolean;
}

// ── Organization ─────────────────────────────────────────────

export interface Organization extends TimestampedEntity {
  name: string;
  slug: string;
  description?: string;
  is_demo: boolean;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
}

// ── Business Profile ─────────────────────────────────────────

export interface BusinessProfile extends TimestampedEntity {
  organization_id: string;
  company_name: string;
  industry: string;
  sub_industry?: string;
  country: string;
  state?: string;
  city?: string;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  revenue_range?: string;
  description?: string;
  website?: string;
  linkedin?: string;
  founded_year?: number;
  capabilities: string[];
  certifications: string[];
  registrations: string[];
  previous_projects: ProjectEntry[];
  geographic_coverage: string[];
  preferred_contract_min?: number;
  preferred_contract_max?: number;
  preferred_currency: string;
  target_markets: string[];
  funding_required: boolean;
  export_focused: boolean;
  growth_goals: string[];
  onboarding_completed: boolean;
}

export interface ProjectEntry {
  title: string;
  client?: string;
  value?: number;
  year?: number;
  description?: string;
}

// ── Opportunity ───────────────────────────────────────────────

export type OpportunityType =
  | 'tender' | 'rfp' | 'rfq' | 'eoi'
  | 'grant' | 'scheme' | 'subsidy'
  | 'accelerator' | 'incubator' | 'challenge'
  | 'partnership' | 'export' | 'research'
  | 'corporate_rfp' | 'procurement' | 'innovation'
  | 'vendor_registration' | 'empanelment';

export type OpportunityCategory =
  | 'government' | 'funding' | 'corporate'
  | 'global' | 'startup' | 'innovation' | 'partnership';

export type VerificationStatus = 'verified' | 'unverified' | 'needs_review' | 'expired';

export type Recommendation = 'pursue' | 'review' | 'partner' | 'watch' | 'skip';

export interface Opportunity extends TimestampedEntity {
  external_id?: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  category: OpportunityCategory;
  sub_category?: string;
  organization_name: string;
  organization_type?: string;
  geography_country: string;
  geography_state?: string;
  geography_city?: string;
  is_international: boolean;
  currency: string;
  value_min?: number;
  value_max?: number;
  value_display?: string;
  deadline?: string;
  published_at?: string;
  last_updated?: string;
  source_url: string;
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_expired: boolean;
  is_demo: boolean;
  requirements: OpportunityRequirement[];
  eligibility_criteria: EligibilityCriterion[];
  required_documents: string[];
  evaluation_criteria: EvaluationCriterion[];
  tags: string[];
  industry_tags: string[];
  technology_tags: string[];
  view_count: number;
  save_count: number;
  // Computed/joined fields
  score?: OpportunityScore;
  is_saved?: boolean;
}

export interface OpportunityRequirement {
  requirement: string;
  type: 'mandatory' | 'desirable';
  category?: string;
}

export interface EligibilityCriterion {
  criterion: string;
  status?: 'satisfied' | 'needs_review' | 'missing' | 'unknown';
  notes?: string;
}

export interface EvaluationCriterion {
  criterion: string;
  weight?: number;
  notes?: string;
}

// ── Opportunity Score ────────────────────────────────────────

export interface OpportunityScore extends TimestampedEntity {
  opportunity_id: string;
  organization_id: string;
  overall_score: number;
  eligibility_score: number;
  business_fit_score: number;
  capability_fit_score: number;
  geographic_fit_score: number;
  value_fit_score: number;
  time_feasibility_score: number;
  competition_score: number;
  execution_fit_score: number;
  recommendation: Recommendation;
  recommendation_reason: string;
  score_metadata: ScoreMetadata;
  is_ai_generated: boolean;
}

export interface ScoreMetadata {
  eligibility_reason?: string;
  business_fit_reason?: string;
  capability_fit_reason?: string;
  geographic_fit_reason?: string;
  value_fit_reason?: string;
  time_feasibility_reason?: string;
  competition_reason?: string;
  execution_fit_reason?: string;
  missing_requirements?: string[];
  strengths?: string[];
  risks?: string[];
}

// ── Application ───────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft' | 'in_progress' | 'review'
  | 'submitted' | 'won' | 'lost' | 'withdrawn';

export type ApplicationOutcome = 'won' | 'lost' | 'pending' | 'withdrawn';

export interface Application extends TimestampedEntity {
  organization_id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  title: string;
  status: ApplicationStatus;
  assigned_to?: string;
  deadline?: string;
  submission_date?: string;
  outcome?: ApplicationOutcome;
  outcome_value?: number;
  outcome_notes?: string;
}

// ── Notification / Alert ──────────────────────────────────────

export type NotificationType =
  | 'new_match' | 'deadline' | 'update'
  | 'score_change' | 'partner' | 'funding';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification extends TimestampedEntity {
  user_id: string;
  organization_id: string;
  type: NotificationType;
  title: string;
  body: string;
  opportunity_id?: string;
  opportunity?: Pick<Opportunity, 'id' | 'title' | 'value_display'>;
  is_read: boolean;
  priority: NotificationPriority;
}

// ── AI Conversation ───────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  is_ai?: boolean;
}

export interface AIConversation extends TimestampedEntity {
  user_id: string;
  organization_id: string;
  title: string;
  messages: ConversationMessage[];
  context_opportunity_ids: string[];
}

// ── Analytics ────────────────────────────────────────────────

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
}

// ── Filters ───────────────────────────────────────────────────

export interface OpportunityFilters {
  type?: OpportunityType | OpportunityType[];
  category?: OpportunityCategory | OpportunityCategory[];
  geography_country?: string;
  geography_state?: string;
  value_min?: number;
  value_max?: number;
  deadline_before?: string;
  deadline_after?: string;
  recommendation?: Recommendation;
  score_min?: number;
  is_verified?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: 'deadline' | 'score' | 'value' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// ── Onboarding ────────────────────────────────────────────────

export interface OnboardingStep1 {
  company_name: string;
  industry: string;
  sub_industry?: string;
  country: string;
  state?: string;
  city?: string;
  company_size: BusinessProfile['company_size'];
  website?: string;
}

export interface OnboardingStep2 {
  opportunity_types: string[];
  preferred_contract_min?: number;
  preferred_contract_max?: number;
  revenue_range?: string;
  preferred_currency: string;
}

export interface OnboardingStep3 {
  geographic_coverage: string[];
  india_states?: string[];
  export_focused: boolean;
}

export interface OnboardingStep4 {
  capabilities: string[];
  technologies: string[];
  certifications: string[];
  registrations: string[];
  years_of_experience?: number;
}

export interface OnboardingStep5 {
  growth_goals: string[];
  funding_required: boolean;
  funding_amount?: number;
  target_sectors: string[];
}
