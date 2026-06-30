from typing import Iterable, List, Mapping


PERSONAS = {
    "default": "You are ARIA, a concise, helpful, voice-first AI assistant. Answer naturally, use markdown for formatting, include relevant emojis sparingly, and keep responses clear.",
    "programmer": "You are ARIA, an expert software engineer 💻. Provide clear, optimized, and robust code snippets using rich Markdown formatting and syntax highlighting. Always explain the code concisely. Use emojis like 🚀, 🐛, and 💡 where appropriate to make it engaging.",
    "creative": "You are ARIA, a creative writer and storyteller ✨. Use vivid language, be imaginative, write beautifully, and sprinkle your writing with expressive emojis 🎭🎨.",
    "sarcastic": "You are ARIA, a highly intelligent but sarcastic friend 🙄. You give helpful answers, but always with a witty, dry, and slightly condescending tone. Feel free to use emojis like 🤦, 💅, or 🤡.",
}

def get_system_prompt(persona: str = None) -> str:
    if not persona:
        persona = "default"
    return PERSONAS.get(persona.lower(), PERSONAS["default"])


def normalize_model(model: str = None) -> str:
    if not model:
        return "gemini"
    value = model.strip().lower()
    if value in {"claude", "anthropic"}:
        return "claude"
    if value in {"gemini", "google"}:
        return "gemini"
    return value


def format_messages(messages: Iterable[Mapping] = None) -> List[dict]:
    formatted = []
    for item in messages or []:
        role = item.get("role", "user")
        content = str(item.get("content", "")).strip()
        if content:
            formatted.append({"role": role, "content": content})
    return formatted


def build_prompt(message: str, messages: Iterable[Mapping] = None, persona: str = None) -> str:
    history = format_messages(messages)
    parts = [get_system_prompt(persona)]
    for item in history:
        parts.append(f"{item['role'].title()}: {item['content']}")
    parts.append(f"User: {message}")
    parts.append("ARIA:")
    return "\n".join(parts)


def fallback_response(message: str) -> str:
    cleaned = message.strip()
    if not cleaned:
        return "I am listening. What would you like to talk about?"
    lower = cleaned.lower()
    if any(word in lower for word in ["summarize", "summary", "explain"]):
        return (
            "I can help with that. Paste the text or document notes here, and I will turn it into "
            "a clear summary with key points, action items, and follow-ups. AI cloud keys are not "
            "configured yet, so this is local assistant mode."
        )
    if any(word in lower for word in ["plan", "schedule", "roadmap", "workflow"]):
        return (
            "A practical starting plan: define the goal, list the inputs you already have, choose "
            "the next three actions, and set a review point. Share your details and I can structure "
            "them into a cleaner workflow once Claude or Gemini is configured."
        )
    if any(word in lower for word in ["email", "reply", "message", "write", "draft"]):
        return (
            "I can draft that. Send the recipient, tone, and the main point you want to make. "
            "For now I am in local fallback mode, but the full chat workflow is ready for your "
            "configured AI provider."
        )
    return (
        "ARIA is connected and your conversation has been saved. Cloud AI is not configured yet, "
        f"so I am replying in local assistant mode. I heard: {cleaned}"
    )


def chunk_text(text: str, chunk_size: int = 80):
    for index in range(0, len(text), chunk_size):
        yield text[index : index + chunk_size]
