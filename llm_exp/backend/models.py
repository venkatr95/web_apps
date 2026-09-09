from sqlalchemy import Column, String, Text, DateTime, Integer, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class FormData(Base):
    """Model for storing form data associated with UUIDs"""
    __tablename__ = "form_data"
    
    uuid = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    company = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    access_count = Column(Integer, default=0)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of = Column(String(36), nullable=True)
    
    def __repr__(self):
        return f"<FormData(uuid={self.uuid}, name={self.name})>"


class UserPreference(Base):
    """Model for storing user preferences and learned behaviors"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    preference_key = Column(String(100), nullable=False, index=True)
    preference_value = Column(Text, nullable=False)
    usage_count = Column(Integer, default=1)
    last_used = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<UserPreference(key={self.preference_key}, value={self.preference_value})>"


class FormInteraction(Base):
    """Model for tracking user interactions with forms"""
    __tablename__ = "form_interactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, index=True)
    field_name = Column(String(50), nullable=False)
    original_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=True)
    interaction_type = Column(String(20), nullable=False)  # 'view', 'edit', 'correction'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<FormInteraction(uuid={self.uuid}, field={self.field_name})>"
