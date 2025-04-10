import pytest
import requests
import conftest

@pytest.fixture
def webApp_IP(request):
    return request.config.getoption("--ip")

# test for the API
def test_check_API():
    response = requests.get(f"https://official-joke-api.appspot.com/random_joke")
    assert response.status_code == 200

# test for landing page
def test_check_WebApp(webApp_IP):
    response = requests.get(f"{webApp_IP}:5000/")
    assert response.status_code == 200

# test for ranking page
def test_check_WebApp_ranking(webApp_IP):
    response = requests.get(f"{webApp_IP}:5000/ranking")
    assert response.status_code == 200

# test for readJokes page
def test_check_WebApp_readJokes(webApp_IP):
    response = requests.get(f"{webApp_IP}:5000/readJokes")
    assert response.status_code == 200

# test for addJoke page
def test_check_WebApp_addJoke(webApp_IP):
    response = requests.get(f"{webApp_IP}:5000/addJoke")
    assert response.status_code == 201