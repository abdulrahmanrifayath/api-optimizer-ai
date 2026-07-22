import sys
import os
import asyncio
import time

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.middleware.rate_limiter import SimpleRateLimiter
from backend.utils.cache import get_cached_response, set_cached_response, clear_cache, ttl_cache

def test_rate_limiter_unit():
    print("[TEST] Testing Sliding Window IP Rate Limiter...")
    limiter = SimpleRateLimiter(requests_per_minute=5)
    test_ip = "192.168.1.50"

    # Send 5 allowed requests
    for i in range(5):
        allowed, retry_after = limiter.is_allowed(test_ip)
        assert allowed is True, f"Request {i+1} should be allowed"
        print(f"Request {i+1}: Allowed=True")

    # 6th request should be blocked
    allowed, retry_after = limiter.is_allowed(test_ip)
    assert allowed is False, "6th request should be blocked!"
    assert retry_after > 0, "Retry-After should be > 0"
    print(f"6th Request: Allowed=False, Retry-After={retry_after}s")
    print("[PASS] Rate Limiting Unit Test Passed!")

def test_in_memory_cache_unit():
    print("\n[TEST] Testing In-Memory TTL Response Cache...")
    clear_cache()

    key = "dashboard_summary_user_1"
    payload = {"score": 95, "status": "Excellent"}

    set_cached_response(key, payload, ttl_seconds=2)
    cached = get_cached_response(key)
    assert cached == payload, f"Expected {payload}, got {cached}"
    print(f"Cached Hit: {cached}")

    # Test TTL expiration
    print("Waiting 2.1s for TTL expiration...")
    time.sleep(2.1)
    expired = get_cached_response(key)
    assert expired is None, "Cache should be expired after TTL"
    print("[PASS] Cache Expiration Verified!")

async def main():
    print("==================================================")
    print("SPRINT 8 VERIFICATION SUITE")
    print("==================================================")
    test_rate_limiter_unit()
    test_in_memory_cache_unit()
    print("\nALL SPRINT 8 SECURITY & PERFORMANCE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
