from dataclasses import dataclass


@dataclass
class Conversation:
    id: str
    user_id: str
    title: str
