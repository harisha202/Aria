from dataclasses import dataclass


@dataclass
class UserSettings:
    id: str
    user_id: str
    voice_preference: str = "default"
    theme: str = "dark"
