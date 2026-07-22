import time
import functools
from typing import Dict, Any, Tuple, Optional

# In-Memory Cache Store: key -> (data, expire_at)
_CACHE_STORE: Dict[str, Tuple[Any, float]] = {}


def get_cached_response(key: str) -> Optional[Any]:
    """Retrieve data from in-memory cache if not expired."""
    if key in _CACHE_STORE:
        data, expire_at = _CACHE_STORE[key]
        if time.time() < expire_at:
            return data
        else:
            del _CACHE_STORE[key]
    return None


def set_cached_response(key: str, data: Any, ttl_seconds: int = 5) -> None:
    """Save data into in-memory cache with specified TTL in seconds."""
    expire_at = time.time() + ttl_seconds
    _CACHE_STORE[key] = (data, expire_at)


def clear_cache(pattern: Optional[str] = None) -> None:
    """Invalidate all or matching keys in the cache store."""
    global _CACHE_STORE
    if not pattern:
        _CACHE_STORE.clear()
    else:
        keys_to_del = [k for k in _CACHE_STORE if pattern in k]
        for k in keys_to_del:
            del _CACHE_STORE[k]


def ttl_cache(ttl_seconds: int = 5):
    """
    Decorator for caching async FastAPI endpoint responses for a given TTL in seconds.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key based on function name and args/kwargs
            cache_key = f"{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            cached = get_cached_response(cache_key)
            if cached is not None:
                return cached

            result = await func(*args, **kwargs)
            set_cached_response(cache_key, result, ttl_seconds=ttl_seconds)
            return result
        return wrapper
    return decorator
