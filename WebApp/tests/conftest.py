# auxiliary file for pytest
def pytest_addoption(parser):
    parser.addoption(
        "--ip", required=True, action="store", default="", help="IP of the VM to access the WebApp"
    )