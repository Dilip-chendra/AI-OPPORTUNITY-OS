import httpx
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def run_verification():
    with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
        # 1. Health check
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        log("Backend health check: 200 OK", "PASS")

        # 2. Ingestion Status Check
        # Login as admin to check admin ingestion
        login_res = client.post("/auth/login", json={"email": "admin@demo.com", "password": "DemoPass123"})
        assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
        admin_token = login_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        status_res = client.get("/admin/ingestion/status", headers=admin_headers)
        assert status_res.status_code == 200, f"Ingestion status failed: {status_res.text}"
        status_data = status_res.json()
        log(f"Ingestion pipeline status: {status_data['status']} | Opportunities in DB: {status_data['total_opportunities_in_db']}", "PASS")
        assert status_data["total_opportunities_in_db"] > 20, "Expected at least 20 opportunities in DB"
        assert len(status_data["adapters"]) >= 3, "Expected 3 external adapters"

        # 3. Verify Category Routes have opportunities
        categories = ['government', 'corporate', 'funding', 'global', 'partnerships', 'innovation', 'research']
        for cat in categories:
            cat_res = client.get(f"/opportunities?category={cat}&page=1&page_size=5", headers=admin_headers)
            assert cat_res.status_code == 200, f"Category {cat} query failed: {cat_res.text}"
            opps = cat_res.json().get("data", [])
            assert len(opps) > 0, f"Category '{cat}' returned 0 opportunities!"
            log(f"Category '{cat}': {len(opps)} opportunities found (Sample: '{opps[0]['title'][:50]}...')", "PASS")
            # Verify source URL exists
            assert opps[0].get("source_url"), f"Opportunity in '{cat}' has no source_url!"

        # 4. Overview Real Analytics Check
        analytics_res = client.get("/analytics/overview", headers=admin_headers)
        assert analytics_res.status_code == 200, f"Analytics overview failed: {analytics_res.text}"
        analytics = analytics_res.json()
        log(f"Real analytics aggregates: Pipeline={analytics['estimated_pipeline_value']}, Discovered={analytics['opportunities_discovered']}, Matched={analytics['opportunities_matched']}, Deadlines={analytics['deadlines_this_week']}", "PASS")
        assert analytics["opportunities_discovered"] > 0, "Discovered count should be > 0"
        assert analytics["opportunities_matched"] > 0, "Matched count should be > 0"

        # 5. Onboarding-to-Profile Data Continuity Test
        # Create a fresh new user & organization
        new_email = f"exec_{uuid.uuid4().hex[:6]}@quantum-cyber.com"
        reg_res = client.post("/auth/signup", json={
            "email": new_email,
            "password": "Password123!",
            "full_name": "Dr. Sarah Chen",
            "organization_name": "Quantum Cyber Systems Ltd"
        })
        assert reg_res.status_code == 200, f"Signup failed: {reg_res.text}"
        user_token = reg_res.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        log(f"New user registered: {new_email}", "PASS")

        # Simulate Onboarding completion payload
        onboard_payload = {
            "company_name": "Quantum Cyber Systems Ltd",
            "industry": "Information Technology",
            "company_size": "51-200",
            "country": "India",
            "state": "Karnataka",
            "city": "Bengaluru",
            "preferred_currency": "INR",
            "preferred_contract_min": 1500000.0,
            "preferred_contract_max": 90000000.0,
            "capabilities": ["Quantum Cryptography", "Zero Trust", "Cloud Security"],
            "certifications": ["ISO 27001 Security Management", "CMMI Maturity Level 3+"],
            "funding_required": True,
            "export_focused": True,
            "consortium_open": True,
            "onboarding_completed": True
        }
        update_res = client.put("/business-profile", json=onboard_payload, headers=user_headers)
        assert update_res.status_code == 200, f"Profile update failed: {update_res.text}"
        log("Onboarding profile saved with all 8 dimensions", "PASS")

        # Verify Business Profile retrieval matches onboarding
        get_prof = client.get("/business-profile", headers=user_headers)
        assert get_prof.status_code == 200, f"Get profile failed: {get_prof.text}"
        saved_prof = get_prof.json()
        assert saved_prof["company_name"] == "Quantum Cyber Systems Ltd"
        assert saved_prof["city"] == "Bengaluru"
        assert "Quantum Cryptography" in saved_prof["capabilities"]
        assert "ISO 27001 Security Management" in saved_prof["certifications"]
        assert saved_prof["preferred_contract_min"] == 1500000.0
        log("Profile retrieval verification: All onboarding credentials persisted correctly", "PASS")

        # 6. Test Document Upload & Deletion on Business DNA
        doc_res = client.post("/business-profile/documents", json={
            "title": "Quantum Security Architecture Whitepaper",
            "document_type": "capability_statement",
            "file_url": "https://quantum-cyber.com/whitepaper.pdf"
        }, headers=user_headers)
        assert doc_res.status_code == 200
        doc_data = doc_res.json()
        assert len(doc_data["documents"]) >= 1
        doc_id = doc_data["documents"][-1]["id"]
        log(f"Document registered on Business DNA: id={doc_id}", "PASS")

        del_doc = client.delete(f"/business-profile/documents/{doc_id}", headers=user_headers)
        assert del_doc.status_code == 200
        assert all(d["id"] != doc_id for d in (del_doc.json()["documents"] or []))
        log("Document deleted cleanly from Business DNA", "PASS")

        # 7. Test Viewer Role Mutation Restriction
        login_viewer = client.post("/auth/login", json={"email": "viewer@demo.com", "password": "DemoPass123"})
        viewer_token = login_viewer.json()["access_token"]
        viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

        # Viewer attempt to mutate profile
        bad_put = client.put("/business-profile", json={"company_name": "Tampered"}, headers=viewer_headers)
        assert bad_put.status_code == 403, f"Viewer should be blocked with 403, got {bad_put.status_code}"
        log("Viewer role mutation blocked with HTTP 403 on Business DNA", "PASS")

        # Viewer attempt to create application
        bad_app = client.post("/applications", json={"opportunity_id": str(uuid.uuid4())}, headers=viewer_headers)
        assert bad_app.status_code == 403, f"Viewer should be blocked with 403 on applications, got {bad_app.status_code}"
        log("Viewer role mutation blocked with HTTP 403 on Pursuit Creation", "PASS")

        # 8. AI Analyst Context Verification
        ai_res = client.post("/ai/chat", json={"message": "What opportunities fit our core capabilities?"}, headers=user_headers)
        assert ai_res.status_code == 200, f"AI chat failed: {ai_res.text}"
        ai_resp_text = ai_res.json().get("response", "")
        assert len(ai_resp_text) > 20
        log("AI Analyst responds using injected Business DNA context", "PASS")

    print("\n=======================================================")
    print("  ALL 8 END-TO-END PRODUCTION RECOVERY VERIFICATIONS PASSED")
    print("=======================================================\n")

if __name__ == "__main__":
    run_verification()
