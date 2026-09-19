from app.services.ingestion.base import BaseSourceAdapter, NormalizedOpportunity
from app.services.ingestion.usaspending_adapter import USASpendingAdapter
from app.services.ingestion.world_bank_adapter import WorldBankAdapter
from app.services.ingestion.uk_contracts_adapter import UKContractsFinderAdapter

__all__ = [
    "BaseSourceAdapter",
    "NormalizedOpportunity",
    "USASpendingAdapter",
    "WorldBankAdapter",
    "UKContractsFinderAdapter",
]
