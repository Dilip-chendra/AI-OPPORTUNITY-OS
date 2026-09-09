import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_opportunities_requires_auth(client: AsyncClient):
    response = await client.get('/opportunities/')
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_list_opportunities_with_auth(client: AsyncClient):
    signup = await client.post('/auth/signup', json={
        'email': 'opp_test@example.com',
        'password': 'TestPass123',
        'full_name': 'Opp Test',
        'organization_name': 'Opp Corp'
    })
    token = signup.json()['access_token']
    response = await client.get('/opportunities/', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = response.json()
    assert 'data' in data
    assert 'total' in data

@pytest.mark.asyncio  
async def test_health(client: AsyncClient):
    response = await client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
