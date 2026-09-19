"""
END-TO-END PERSISTENCE TEST
Tests: login → profile write → verify read → update → verify update
"""
import httpx
import json
import sys
import time

BASE = "http://localhost:8000"

def step(msg):
    print(f"\n{'='*50}")
    print(f"STEP: {msg}")
    print('='*50)

def ok(msg):
    print(f"  [PASS] {msg}")

def fail(msg):
    print(f"  [FAIL] {msg}")

def info(msg):
    print(f"  [INFO] {msg}")

# 1. Login
step("1. Login as dilip.madagari@gmail.com")
r = httpx.post(f"{BASE}/auth/login", json={"email": "dilip.madagari@gmail.com", "password": "DemoPass123"})
info(f"Status: {r.status_code}")
if r.status_code != 200:
    print(f"  CRITICAL: Login failed: {r.text[:200]}")
    sys.exit(1)
data = r.json()
token = data.get("access_token")
user_id = data.get("user", {}).get("id")
org_id = data.get("user", {}).get("organization_id")
info(f"user_id={user_id}, org_id={org_id}")
ok("Login succeeded")

headers = {"Authorization": f"Bearer {token}"}

# 2. Get current profile
step("2. GET current business profile")
r = httpx.get(f"{BASE}/business-profile/", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    profile = r.json()
    info(f"company_name={profile.get('company_name')!r}")
    info(f"industry={profile.get('industry')!r}")
    info(f"capabilities={str(profile.get('capabilities'))[:100]!r}")
    ok("Profile GET succeeded")
else:
    profile = {}
    fail(f"No profile found: {r.text[:100]}")

# 3. Write test profile
step("3. PUT business profile with Test AI Solutions data")
payload = {
    "company_name": "Test AI Solutions",
    "industry": "Artificial Intelligence",
    "website": "https://test.example.com",
    "products_services": ["AI Automation"],
    "capabilities": ["AI development", "automation", "Machine Learning Consulting"],
    "tech_stack": ["Python", "NLP", "Computer Vision", "FastAPI"],
    "geographic_coverage": ["India"],
    "preferred_contract_min": 2000000,
    "preferred_contract_max": 10000000,
    "preferred_currency": "INR",
    "growth_goals": "Government and enterprise AI opportunities",
    "country": "India",
    "description": "AI/ML solutions company focused on automation and consulting",
    "business_stage": "growth",
    "onboarding_completed": True,
}
r = httpx.put(f"{BASE}/business-profile/", json=payload, headers=headers)
info(f"Status: {r.status_code}")
if r.status_code in (200, 201):
    saved = r.json()
    info(f"Saved company_name={saved.get('company_name')!r}")
    info(f"Saved industry={saved.get('industry')!r}")
    info(f"Saved capabilities={str(saved.get('capabilities'))[:100]!r}")
    ok("Profile PUT succeeded")
else:
    fail(f"PUT failed: {r.text[:300]}")

# 4. Immediately re-read to verify persistence
step("4. GET profile immediately after write (persistence check)")
r = httpx.get(f"{BASE}/business-profile/", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    profile2 = r.json()
    if profile2.get('company_name') == "Test AI Solutions":
        ok(f"company_name persisted: {profile2.get('company_name')!r}")
    else:
        fail(f"company_name NOT persisted. Got: {profile2.get('company_name')!r}")
    if profile2.get('industry') == "Artificial Intelligence":
        ok(f"industry persisted: {profile2.get('industry')!r}")
    else:
        fail(f"industry NOT persisted. Got: {profile2.get('industry')!r}")
    if "Python" in str(profile2.get('tech_stack', [])):
        ok(f"tech_stack persisted: {profile2.get('tech_stack')!r}")
    else:
        fail(f"tech_stack NOT persisted. Got: {profile2.get('tech_stack')!r}")
else:
    fail(f"GET after write failed: {r.text[:100]}")

# 5. Edit profile
step("5. PATCH profile to change industry and geography")
r = httpx.put(f"{BASE}/business-profile/", json={**payload,
    "industry": "SaaS / Enterprise Software",
    "geographic_coverage": ["India", "Southeast Asia"],
    "capabilities": ["AI development", "automation", "SaaS product development", "API integration"],
}, headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    ok("Edit PUT succeeded")
else:
    fail(f"Edit failed: {r.text[:200]}")

# 6. Re-read after edit
step("6. GET profile after edit")
r = httpx.get(f"{BASE}/business-profile/", headers=headers)
if r.status_code == 200:
    profile3 = r.json()
    if profile3.get('industry') == "SaaS / Enterprise Software":
        ok(f"Edited industry persisted: {profile3.get('industry')!r}")
    else:
        fail(f"Edited industry NOT persisted: {profile3.get('industry')!r}")
    geo = profile3.get('geographic_coverage') or []
    if "Southeast Asia" in str(geo):
        ok(f"Edited geography persisted: {geo!r}")
    else:
        fail(f"Edited geography NOT persisted: {geo!r}")
else:
    fail(f"GET after edit failed")

# 7. Opportunity radar with real data
step("7. GET /opportunities (check real data pipeline)")
r = httpx.get(f"{BASE}/opportunities?limit=10", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    d = r.json()
    items = d.get("data") or d if isinstance(d, list) else d.get("items", [])
    if isinstance(d, dict):
        items = d.get("data", d.get("items", []))
    total = d.get("total") if isinstance(d, dict) else len(items)
    info(f"total={total}, items_returned={len(items) if isinstance(items, list) else '?'}")
    if items:
        sample = items[0]
        info(f"sample title={sample.get('title')!r}")
        info(f"sample source_url={sample.get('source_url')!r}")
        info(f"sample is_demo={sample.get('is_demo')}")
        ok("Opportunities endpoint returns real data")
    else:
        fail("No opportunities returned")
else:
    fail(f"GET /opportunities failed: {r.text[:100]}")

# 8. Test save
step("8. Save an opportunity")
r2 = httpx.get(f"{BASE}/opportunities?limit=1", headers=headers)
if r2.status_code == 200:
    d2 = r2.json()
    items2 = d2.get("data", []) if isinstance(d2, dict) else d2
    if items2:
        opp_id = items2[0].get("id")
        r_save = httpx.post(f"{BASE}/opportunities/{opp_id}/save", headers=headers)
        info(f"Save status: {r_save.status_code}")
        if r_save.status_code in (200, 201):
            ok(f"Save succeeded for opp_id={opp_id}")
            # Check saved list
            r_saved = httpx.get(f"{BASE}/opportunities/saved", headers=headers)
            saved_items = r_saved.json() if r_saved.status_code == 200 else []
            saved_ids = [s.get("id") for s in (saved_items if isinstance(saved_items, list) else [])]
            if opp_id in saved_ids:
                ok("Saved opportunity appears in /opportunities/saved")
            else:
                fail(f"Saved opp {opp_id} NOT in saved list. Got: {saved_ids[:3]}")
        else:
            fail(f"Save failed: {r_save.text[:100]}")

# 9. Test AI endpoint
step("9. GET /opportunities/stats")
r = httpx.get(f"{BASE}/opportunities/stats", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    stats = r.json()
    info(f"Stats: {json.dumps(stats, indent=2)[:300]}")
    if stats.get("total", 0) > 0:
        ok("Stats endpoint returns real counts")
    else:
        fail("Stats shows 0 total — may be wrong")
else:
    fail(f"Stats failed: {r.text[:100]}")

# 10. Test search
step("10. Search /search?q=AI")
r = httpx.get(f"{BASE}/search?q=AI&limit=5", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    d = r.json()
    items = d.get("data", d.get("results", d if isinstance(d, list) else []))
    info(f"results count: {len(items) if isinstance(items, list) else '?'}")
    if items:
        ok(f"Search returns results: {items[0].get('title')!r}")
    else:
        fail("Search returned empty results for 'AI'")
else:
    fail(f"Search failed: {r.text[:100]}")

# 11. Search distinct term
step("11. Search /search?q=XYZNOMATCH (should return 0 or few)")
r = httpx.get(f"{BASE}/search?q=XYZNOMATCH&limit=5", headers=headers)
info(f"Status: {r.status_code}")
if r.status_code == 200:
    d = r.json()
    items = d.get("data", d.get("results", d if isinstance(d, list) else []))
    info(f"results count: {len(items) if isinstance(items, list) else '?'}")
    if len(items) == 0:
        ok("Distinct search returns 0 results (correct)")
    else:
        fail(f"Distinct search returned {len(items)} results (filter may not work)")

print("\n" + "="*50)
print("END-TO-END PERSISTENCE TEST COMPLETE")
print("="*50)
