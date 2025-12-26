from passlib.context import CryptContext
import logging

logging.basicConfig(level=logging.DEBUG)

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password = "secret"
    print(f"Hashing password: '{password}' (len={len(password)})")
    hashed = pwd_context.hash(password)
    print(f"Hashed: {hashed}")
    print(f"Verify: {pwd_context.verify(password, hashed)}")
except Exception as e:
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
