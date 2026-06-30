"""Central structured logger for ARIA backend."""

import logging
import os


def get_logger(name: str) -> logging.Logger:
    """
    Return a configured logger for the given module name.

    Log level is read from the LOG_LEVEL env var (default: INFO).
    In production (DEBUG=false) the format is compact; in dev it includes
    module path + line number for easier tracing.
    """
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # Already configured — avoid duplicate handlers

    logger.setLevel(level)

    handler = logging.StreamHandler()
    handler.setLevel(level)

    is_debug = os.getenv("DEBUG", "false").lower() == "true"
    fmt = (
        "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d — %(message)s"
        if is_debug
        else "%(asctime)s [%(levelname)s] %(name)s — %(message)s"
    )
    handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S"))
    logger.addHandler(handler)
    logger.propagate = False
    return logger
