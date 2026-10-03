"""
User Model for Smart OR Scheduler
Roles: Admin, Scheduler, Viewer
"""

from typing import Dict, Any, Optional
import hashlib
import time

def hash_password(password: str, salt: str = "smart_or_salt") -> str:
    """Returns SHA256 hashed password with salt."""
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()

def verify_password(password: str, password_hash: str, salt: str = "smart_or_salt") -> bool:
    return hash_password(password, salt) == password_hash

class User:
    def __init__(
        self,
        id: str,
        name: str,
        email: str,
        password_hash: str,
        role: str = "Viewer",
        created_at: Optional[float] = None
    ):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.role = role # "Admin", "Scheduler", "Viewer"
        self.created_at = created_at or time.time()

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at
        }
        if include_sensitive:
            data["password_hash"] = self.password_hash
        return data
