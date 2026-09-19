import sqlite3, json

db = sqlite3.connect('opportunity_os.db')
cur = db.cursor()

# --- OPPORTUNITIES ---
cur.execute('SELECT COUNT(*) FROM opportunities')
total_opps = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM opportunities WHERE is_demo=1")
demo_opps = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM opportunities WHERE source_url IS NOT NULL AND source_url != ''")
with_url = cur.fetchone()[0]

cur.execute("SELECT category, COUNT(*) FROM opportunities GROUP BY category ORDER BY COUNT(*) DESC")
cats = cur.fetchall()

cur.execute("SELECT title, source_url, external_id, is_demo, is_verified, created_at FROM opportunities ORDER BY created_at DESC LIMIT 8")
recent = cur.fetchall()

# Sample real record
cur.execute("SELECT title, description, source_url, external_id, organization_name, category, geography_country FROM opportunities WHERE is_demo=0 LIMIT 3")
real_samples = cur.fetchall()

# --- USER/ORG ---
cur.execute('SELECT COUNT(*) FROM users')
users = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM organizations')
orgs = cur.fetchone()[0]

cur.execute('SELECT id, name FROM organizations')
org_list = cur.fetchall()

# --- BUSINESS PROFILES ---
cur.execute('SELECT COUNT(*) FROM business_profiles')
profiles = cur.fetchone()[0]

cur.execute("SELECT id, company_name, industry, geographic_coverage, revenue_range, capabilities FROM business_profiles LIMIT 5")
bps = cur.fetchall()

# --- OTHER ---
cur.execute('SELECT COUNT(*) FROM applications')
apps_count = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM evidence_documents')
evid = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM opportunity_scores')
scores = cur.fetchone()[0]

cur.execute('SELECT COUNT(*) FROM saved_opportunities')
saved = cur.fetchone()[0]

print("=" * 60)
print("DATABASE STATE REPORT")
print("=" * 60)
print(f"\nOPPORTUNITIES:")
print(f"  Total:          {total_opps}")
print(f"  Demo/Fake:      {demo_opps}")
print(f"  With source URL:{with_url}")
print(f"  Real (non-demo):{total_opps - demo_opps}")
print(f"\n  By category:")
for cat, cnt in cats:
    print(f"    {cat or 'None'}: {cnt}")

print(f"\nRECENT RECORDS (newest 8):")
for r in recent:
    title, src_url, ext_id, is_demo, is_verified, created = r
    print(f"  [{created}] {title[:50]!r}")
    print(f"    ext_id={ext_id!r}  demo={is_demo}  verified={is_verified}")
    print(f"    url={src_url[:70] if src_url else 'NONE'!r}")

print(f"\nREAL SAMPLE RECORDS:")
for s in real_samples:
    title, desc, url, ext_id, org, cat, geo = s
    print(f"  Title: {title!r}")
    print(f"  Org:   {org!r}")
    print(f"  Cat:   {cat!r} / {geo!r}")
    print(f"  ExtID: {ext_id!r}")
    print(f"  URL:   {url!r}")
    print(f"  Desc:  {(desc or '')[:100]!r}")
    print()

print(f"\nUSERS / ORGS:")
print(f"  Users: {users}")
print(f"  Orgs:  {orgs}")
for oid, oname in org_list:
    print(f"    [{oid}] {oname!r}")

print(f"\nBUSINESS PROFILES: {profiles}")
for bp in bps:
    bid, bname, ind, geo, rev, cap = bp
    print(f"  {bname!r} | industry={ind!r} | geo={geo!r} | revenue={rev!r}")
    print(f"  capabilities={str(cap)[:100]!r}")

print(f"\nAPPLICATIONS: {apps_count}")
print(f"EVIDENCE DOCS: {evid}")
print(f"SCORES: {scores}")
print(f"SAVED: {saved}")

db.close()
print("\nDONE")
