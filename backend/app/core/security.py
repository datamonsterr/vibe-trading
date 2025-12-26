from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 30))
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")


def verify_password(plain_password, hashed_password):
    if isinstance(plain_password, str):
        plain_password = plain_password.encode("utf-8")
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_password, hashed_password)


def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode("utf-8")
    # Generate salt and hash
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password, salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def encrypt_token(token: str) -> str:
    if not ENCRYPTION_KEY:
        raise ValueError("ENCRYPTION_KEY not set")
    f = Fernet(ENCRYPTION_KEY)
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    if not ENCRYPTION_KEY:
        raise ValueError("ENCRYPTION_KEY not set")
    f = Fernet(ENCRYPTION_KEY)
    return f.decrypt(encrypted_token.encode()).decode()
