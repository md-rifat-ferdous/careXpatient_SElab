import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service


def pytest_addoption(parser):
    parser.addoption("--headed", action="store_true", default=False,
                     help="Show browser window during tests")


@pytest.fixture(scope="function")
def driver(request):
    opts = Options()
    if not request.config.getoption("--headed"):
        opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    yield driver
    driver.quit()


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """On test failure, log the current URL and a page snippet."""
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver:
            try:
                print(f"\n[DEBUG] Current URL: {driver.current_url}")
                snippet = driver.find_element("tag name", "body").text[:500]
                print(f"[DEBUG] Page body snippet:\n{snippet}")
            except Exception:
                print("[DEBUG] Could not get page source")
