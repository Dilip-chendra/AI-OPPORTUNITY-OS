"""
TEST AUTH WORKFLOW: Duplicate Signup & Forgot/Reset Password
"""
import httpx
import sys

BASE = "http://localhost:8000"

def test_duplicate_signup():
    print("\n--- 1. Testing Duplicate Signup ---")
    payload = {
        "email": "dilip.madagari@gmail.com",
        "password": "Password123!",
        "full_name": "Dilip Chendra",
        "organization_name": "Opportunity Global"
    }
    r = httpx.post(f"{BASE}/auth/signup", json=payload)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.json()}")
    assert r.status_code == 400, f"Expected 400, got {r.status_code}"
    assert "email already registered" in r.json().get("detail", "").lower()
    print("PASS: Duplicate signup correctly returns 400 with clear 'Email already registered' detail.")

def test_forgot_and_reset_password():
    print("\n--- 2. Testing Forgot Password Request ---")
    r = httpx.post(f"{BASE}/auth/forgot-password", json={"email": "dilip.madagari@gmail.com"})
    print(f"Status: {r.status_code}")
    data = r.json()
    print(f"Body: {data}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "reset_token" in data and data["reset_token"]
    token = data["reset_token"]
    print("PASS: Reset token generated successfully.")

    print("\n--- 3. Testing Reset Password Execution ---")
    temp_pass = "NewDemoPass123!"
    r2 = httpx.post(f"{BASE}/auth/reset-password", json={"token": token, "new_password": temp_pass})
    print(f"Status: {r2.status_code}")
    print(f"Body: {r2.json()}")
    assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"
    print("PASS: Password updated.")

    print("\n--- 4. Testing Login with New Password ---")
    r3 = httpx.post(f"{BASE}/auth/login", json={"email": "dilip.madagari@gmail.com", "password": temp_pass})
    print(f"Status: {r3.status_code}")
    assert r3.status_code == 200, f"Expected 200, got {r3.status_code}"
    print(f"Logged in user: {r3.json().get('user', {}).get('email')}")
    print("PASS: Login with updated password succeeded.")

    print("\n--- 5. Restoring Original Password (DemoPass123) ---")
    r_token = httpx.post(f"{BASE}/auth/forgot-password", json={"email": "dilip.madagari@gmail.com"}).json()["reset_token"]
    r_restore = httpx.post(f"{BASE}/auth/reset-password", json={"token": r_token, "new_password": "DemoPass123"})
    assert r_restore.status_code == 200
    r_verify = httpx.post(f"{BASE}/auth/login", json={"email": "dilip.madagari@gmail.com", "password": "DemoPass123"})
    assert r_verify.status_code == 200
    print("PASS: Password safely restored to DemoPass123.")

if __name__ == "__main__":
    test_duplicate_signup()
    test_forgot_and_reset_password()
    print("\n ALL AUTH RECOVERY TESTS PASSED!")
