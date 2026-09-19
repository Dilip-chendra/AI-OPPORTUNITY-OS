"""
LIVE SOURCE CONNECTOR VERIFICATION
Tests real HTTP fetches from each adapter. Records status, timestamp, size, records.
"""
import asyncio
import httpx
import json
import sys
import time
from datetime import datetime

results = {}

async def test_world_bank():
    t0 = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            url = "https://search.worldbank.org/api/v2/projects"
            params = {"format": "json", "rows": 5, "source": "IBRD", "status": "Active"}
            r = await client.get(url, params=params)
            elapsed = time.time() - t0
            body = r.json()
            projects = body.get("projects", {})
            count = len(projects) if isinstance(projects, dict) else 0
            sample = list(projects.values())[:1] if count > 0 else []
            return {
                "status": r.status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "elapsed_s": round(elapsed, 2),
                "response_bytes": len(r.content),
                "records_received": count,
                "sample_id": sample[0].get("id") if sample else None,
                "sample_title": sample[0].get("project_name", "")[:80] if sample else None,
                "error": None
            }
    except Exception as e:
        return {"status": None, "error": str(e), "elapsed_s": round(time.time()-t0, 2)}

async def test_usaspending():
    t0 = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            url = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
            payload = {
                "filters": {
                    "award_type_codes": ["A", "B", "C", "D"],
                    "time_period": [{"start_date": "2024-01-01", "end_date": "2025-12-31"}]
                },
                "fields": ["Award ID", "Recipient Name", "Description", "Award Amount", "Awarding Agency"],
                "limit": 5, "page": 1
            }
            r = await client.post(url, json=payload)
            elapsed = time.time() - t0
            body = r.json()
            results_list = body.get("results", [])
            sample = results_list[:1]
            return {
                "status": r.status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "elapsed_s": round(elapsed, 2),
                "response_bytes": len(r.content),
                "records_received": len(results_list),
                "sample_id": sample[0].get("Award ID") if sample else None,
                "sample_title": sample[0].get("Description", "")[:80] if sample else None,
                "error": None
            }
    except Exception as e:
        return {"status": None, "error": str(e), "elapsed_s": round(time.time()-t0, 2)}

async def test_uk_contracts():
    t0 = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            url = "https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search"
            params = {"publishedFrom": "2024-01-01", "size": 5}
            r = await client.get(url, params=params)
            elapsed = time.time() - t0
            try:
                body = r.json()
                releases = body.get("releases", [])
                count = len(releases)
                sample = releases[:1]
            except Exception:
                releases = []
                count = 0
                sample = []
                body = {}
            return {
                "status": r.status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "elapsed_s": round(elapsed, 2),
                "response_bytes": len(r.content),
                "records_received": count,
                "sample_id": sample[0].get("ocid") if sample else None,
                "sample_title": (sample[0].get("tender", {}) or {}).get("title", "")[:80] if sample else None,
                "error": None
            }
    except Exception as e:
        return {"status": None, "error": str(e), "elapsed_s": round(time.time()-t0, 2)}

async def test_gem_connectivity():
    t0 = time.time()
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get("https://gem.gov.in")
            elapsed = time.time() - t0
            return {
                "status": r.status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "elapsed_s": round(elapsed, 2),
                "response_bytes": len(r.content),
                "note": "GeM has no public API — uses curated static records. Connectivity check only.",
                "records_received": "N/A — static dataset (5 curated records)",
                "error": None
            }
    except Exception as e:
        return {"status": None, "error": str(e), "elapsed_s": round(time.time()-t0, 2)}

async def test_startup_india_connectivity():
    t0 = time.time()
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get("https://www.startupindia.gov.in")
            elapsed = time.time() - t0
            return {
                "status": r.status_code,
                "timestamp": datetime.utcnow().isoformat(),
                "elapsed_s": round(elapsed, 2),
                "response_bytes": len(r.content),
                "note": "Startup India has no public API — uses curated static records. Connectivity check only.",
                "records_received": "N/A — static dataset (7 curated records)",
                "error": None
            }
    except Exception as e:
        return {"status": None, "error": str(e), "elapsed_s": round(time.time()-t0, 2)}

async def main():
    print("=" * 60)
    print("LIVE SOURCE CONNECTOR VERIFICATION")
    print(f"Run at: {datetime.utcnow().isoformat()} UTC")
    print("=" * 60)
    
    print("\n[1] World Bank API (search.worldbank.org)...")
    wb = await test_world_bank()
    print(f"  Status: {wb.get('status')}  Elapsed: {wb.get('elapsed_s')}s  Records: {wb.get('records_received')}")
    print(f"  Bytes: {wb.get('response_bytes')}  Sample: {wb.get('sample_title')!r}")
    if wb.get('error'): print(f"  ERROR: {wb['error']}")
    
    print("\n[2] USASpending.gov API...")
    usa = await test_usaspending()
    print(f"  Status: {usa.get('status')}  Elapsed: {usa.get('elapsed_s')}s  Records: {usa.get('records_received')}")
    print(f"  Bytes: {usa.get('response_bytes')}  Sample: {usa.get('sample_title')!r}")
    if usa.get('error'): print(f"  ERROR: {usa['error']}")
    
    print("\n[3] UK Contracts Finder (contractsfinder.service.gov.uk)...")
    uk = await test_uk_contracts()
    print(f"  Status: {uk.get('status')}  Elapsed: {uk.get('elapsed_s')}s  Records: {uk.get('records_received')}")
    print(f"  Bytes: {uk.get('response_bytes')}  Sample: {uk.get('sample_title')!r}")
    if uk.get('error'): print(f"  ERROR: {uk['error']}")
    
    print("\n[4] India GeM (gem.gov.in) — connectivity only (no public API)...")
    gem = await test_gem_connectivity()
    print(f"  Status: {gem.get('status')}  Elapsed: {gem.get('elapsed_s')}s")
    print(f"  Note: {gem.get('note')}")
    if gem.get('error'): print(f"  ERROR: {gem['error']}")
    
    print("\n[5] Startup India (startupindia.gov.in) — connectivity only (no public API)...")
    si = await test_startup_india_connectivity()
    print(f"  Status: {si.get('status')}  Elapsed: {si.get('elapsed_s')}s")
    print(f"  Note: {si.get('note')}")
    if si.get('error'): print(f"  ERROR: {si['error']}")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    statuses = [
        ("WorldBank", wb.get('status'), "REAL_HTTP_FETCH"),
        ("USASpending", usa.get('status'), "REAL_HTTP_FETCH"),
        ("UKContracts", uk.get('status'), "REAL_HTTP_FETCH"),
        ("IndiaGeM", gem.get('status'), "STATIC_CURATED_DATA"),
        ("StartupIndia", si.get('status'), "STATIC_CURATED_DATA"),
    ]
    for name, status, kind in statuses:
        ok = "✓" if status and status < 400 else "✗" if status else "?"
        print(f"  {ok} {name}: HTTP {status}  [{kind}]")

asyncio.run(main())
