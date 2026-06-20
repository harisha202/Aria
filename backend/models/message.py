from dataclasses import dataclass


@dataclass
class Message:
    id: str
    conversation_id: str
    user_id: str
    content: str
    sender_type: str = "user"
