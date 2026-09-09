from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    opportunities_discovered: int
    opportunities_matched: int
    opportunities_pursued: int
    opportunities_submitted: int
    opportunities_won: int
    estimated_pipeline_value: float
    realized_value: float
    win_rate: float
    average_match_score: float
    new_matches_this_week: int
    deadlines_this_week: int
    high_priority_count: int
    saved_count: int
