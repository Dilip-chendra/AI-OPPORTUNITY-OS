from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any


@dataclass
class NormalizedOpportunity:
    external_id: str
    title: str
    description: str
    organization_name: str
    category: str  # 'government' | 'corporate' | 'funding' | 'global' | 'partnerships' | 'innovation' | 'research'
    opportunity_type: str  # 'tender' | 'grant' | 'rfp' | 'procurement' | 'scheme' | 'challenge'
    value_min: float
    value_max: float
    currency: str
    deadline: Optional[datetime]
    published_at: Optional[datetime]
    source_url: str
    organization_type: str = "Government / Public Sector"
    geography_country: str = "United States"
    geography_state: Optional[str] = None
    geography_city: Optional[str] = None
    is_international: bool = False
    is_verified: bool = True
    verification_status: str = "verified"
    is_demo: bool = False
    requirements: List[str] = field(default_factory=list)
    eligibility_criteria: List[str] = field(default_factory=list)
    required_documents: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    industry_tags: List[str] = field(default_factory=list)
    technology_tags: List[str] = field(default_factory=list)
    raw_payload: Optional[Dict[str, Any]] = None


class BaseSourceAdapter(ABC):
    """
    Abstract interface that every opportunity ingestion source adapter must implement.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for this adapter (e.g. 'usaspending', 'world_bank')."""
        pass

    @property
    @abstractmethod
    def default_category(self) -> str:
        """Default category for opportunities discovered by this adapter."""
        pass

    @abstractmethod
    async def fetch(self, limit: int = 15) -> List[NormalizedOpportunity]:
        """Fetch and normalize opportunities from the external source."""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Verify connectivity to external API endpoint."""
        pass
