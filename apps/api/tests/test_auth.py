import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    response = await client.post('/auth/signup', json={
        'email': 'test@example.com',
        'password': 'TestPass123',
        'full_name': 'Test User',
        'organization_name': 'Test Corp'
    })
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert data['user']['email'] == 'test@example.com'

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # First signup
    await client.post('/auth/signup', json={
        'email': 'login_test@example.com',
        'password': 'TestPass123',
        'full_name': 'Login Test',
        'organization_name': 'Login Corp'
    })
    # Then login
    response = await client.post('/auth/login', json={
        'email': 'login_test@example.com',
        'password': 'TestPass123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json()

@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    response = await client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'WrongPass123'
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient):
    response = await client.get('/auth/me')
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_me_with_auth(client: AsyncClient):
    signup = await client.post('/auth/signup', json={
        'email': 'me_test@example.com',
        'password': 'TestPass123',
        'full_name': 'Me Test',
        'organization_name': 'Me Corp'
    })
    token = signup.json()['access_token']
    response = await client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.json()['email'] == 'me_test@example.com'
