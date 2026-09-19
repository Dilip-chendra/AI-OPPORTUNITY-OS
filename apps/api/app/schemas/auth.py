from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    expires_in: int

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization_id: str
    organization_name: str
    role: str
    is_admin: bool
    model_config = {'from_attributes': True}

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = 'bearer'
    expires_in: int

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None
    reset_url: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
