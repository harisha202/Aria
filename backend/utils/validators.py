def validate_required(value: str) -> bool:
    return bool(value and value.strip())
