import pytest
import requests
import conftest

@pytest.fixture
def webApp_IP(request):
    return request.config.getoption("--ip")

# test for the API
def test_check_API():
    """Test for the API"""
    response = requests.get(f"https://official-joke-api.appspot.com/random_joke")
    assert response.status_code == 200

# tests, where WebApp needs to run
def test_check_WebApp(webApp_IP):
    """Test for the landing page"""
    response = requests.get(f"http://{webApp_IP}:5000/")
    assert response.status_code == 200

def test_check_WebApp_ranking(webApp_IP):
    """Test for the ranking page"""
    response = requests.get(f"http://{webApp_IP}:5000/ranking")
    assert response.status_code == 200