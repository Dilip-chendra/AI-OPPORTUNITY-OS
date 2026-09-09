from sqlalchemy import Column, String, Boolean
from app.models.base import TimestampedModel

class Organization(TimestampedModel):
    __tablename__ = "organizations"
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    plan = Column(String, default="free")
