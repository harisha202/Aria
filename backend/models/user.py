from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    id: str
    email: str
    full_name: Optional[str] = None
