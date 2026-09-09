from pydantic import BaseModel
from typing import TypeVar, Generic, List, Optional

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    success: bool = True
