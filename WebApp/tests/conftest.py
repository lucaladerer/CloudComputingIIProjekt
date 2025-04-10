# auxiliary file for pytest
def pytest_addoption(parser):
    parser.addoption(
        "--ip", action="store", default="127.0.0.1", help="IP of the VM to access the WebApp"
    )