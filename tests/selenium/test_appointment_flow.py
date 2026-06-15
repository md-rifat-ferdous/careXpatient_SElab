"""
Selenium E2E Test — Doctor Appointment Booking & Acceptance Flow

Prerequisites:
  pip install selenium pytest webdriver-manager

Usage:
  pytest tests/selenium/test_appointment_flow.py -v --headed   # visible browser
  pytest tests/selenium/test_appointment_flow.py -v            # headless (default)

Requires:
  - Backend running on http://localhost:5000
  - Frontend running on http://localhost:3000
  - npm run seed:all executed beforehand
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

# ── Test Credentials ──────────────────────────────────────────────
PATIENT_PHONE = "01700000001"
PATIENT_PASSWORD = "patient123"
DOCTOR_PHONE = "01711111111"
DOCTOR_PASSWORD = "doctor123"
DEMO_OTP = "1234"


# ── Helper Functions ──────────────────────────────────────────────


def login(driver, role_selector, phone_selector, phone, password_selector, password):
    wait = WebDriverWait(driver, 10)
    driver.get(f"{BASE_URL}/login")

    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, role_selector))).click()
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, phone_selector))).send_keys(phone)
    driver.find_element(By.CSS_SELECTOR, password_selector).send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(lambda d: "/login" not in d.current_url)


def logout(driver):
    driver.get(f"{BASE_URL}/logout")


def wait_for_text(driver, text, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(),'{text}')]"))
    )


def click_first_book_now(driver, timeout=15):
    """Wait for any 'Book Now' button to appear and click it."""
    wait = WebDriverWait(driver, timeout)
    btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[text()='Book Now']")
    ))
    btn.click()


def pick_first_date(driver, timeout=10):
    """Pick the first clickable date button inside the booking drawer."""
    wait = WebDriverWait(driver, timeout)
    # Date buttons have inner <span> elements (day, date, month).
    # Grab the first button inside the aside that contains a <span>.
    btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "(//aside//button[.//span])[1]")
    ))
    btn.click()


def pick_first_slot(driver, timeout=10):
    """Pick the first available (non-disabled) time slot in the booking drawer."""
    wait = WebDriverWait(driver, timeout)
    btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH,
         "(//aside//button[not(.//span) and not(contains(@class,'cursor-not-allowed'))])[1]")
    ))
    btn.click()


def enter_otp_and_confirm(driver, otp=DEMO_OTP, timeout=10):
    """Fill 4 OTP boxes and click Verify & Confirm."""
    wait = WebDriverWait(driver, timeout)
    boxes = wait.until(EC.presence_of_all_elements_located(
        (By.CSS_SELECTOR, "div.flex.gap-3.mb-4 input")
    ))
    assert len(boxes) >= 4
    for i, digit in enumerate(otp):
        boxes[i].send_keys(digit)
    driver.find_element(
        By.XPATH, "//button[contains(text(),'Verify & Confirm')]"
    ).click()


# ── Patient Booking Helper (shared by both tests) ─────────────────


def patient_books_appointment(driver):
    """Full booking flow: login → book page → pick doctor → book → confirm."""
    wait = WebDriverWait(driver, 15)

    login(driver,
          "#login-role-patient",
          "#patient-login-phone", PATIENT_PHONE,
          "#patient-login-password", PATIENT_PASSWORD)

    # Navigate to Find a Doctor
    driver.get(f"{BASE_URL}/dashboard/patient/appointments/book")

    # Check if doctors loaded; bail with clear message if not
    body_text = driver.find_element(By.TAG_NAME, "body").text
    if "No doctors found" in body_text or "doctors" not in body_text.lower():
        pytest.fail("No doctors loaded — is the backend running and seeded?")

    click_first_book_now(driver)
    print("✓ Clicked Book Now")

    # Wait for drawer to open
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//h2[contains(text(),'Book Appointment')]")
    ))

    # Select Online type — button text is "🎥 Online"
    driver.find_element(
        By.XPATH, "//button[contains(text(),'Online')]"
    ).click()
    print("✓ Selected Online consultation")

    pick_first_date(driver)
    print("✓ Picked a date")

    pick_first_slot(driver)
    print("✓ Picked a time slot")

    # Fill name if empty (pre-filled from auth in real code)
    name_input = driver.find_element(By.XPATH, "//input[@placeholder='Full Name']")
    if not name_input.get_attribute("value"):
        name_input.send_keys("Test Patient")

    # Confirm
    driver.find_element(
        By.XPATH, "//button[contains(text(),'Confirm Appointment')]"
    ).click()
    print("✓ Confirm Appointment clicked")

    # OTP step
    enter_otp_and_confirm(driver)
    print("✓ OTP entered and confirmed")

    # Assert success
    wait_for_text(driver, "Appointment Confirmed!")
    print("✓ Appointment Confirmed!")

    # Navigate back to appointments list
    driver.find_element(
        By.XPATH, "//a[contains(text(),'View My Appointments')]"
    ).click()
    wait.until(EC.url_contains("/dashboard/patient/appointments"))


# ── Tests ─────────────────────────────────────────────────────────


class TestAppointmentFlow:
    """Full end-to-end: patient books → doctor accepts."""

    def test_full_appointment_booking_and_acceptance(self, driver):
        patient_books_appointment(driver)

        # Verify Pending badge on patient page
        pending = wait_for_text(driver, "Pending")
        assert pending.is_displayed()
        print("✓ Appointment shows as Pending on patient page")

        # ── Doctor logs in and accepts ──
        logout(driver)

        login(driver,
              "#login-role-doctor",
              "#doctor-login-phone", DOCTOR_PHONE,
              "#doctor-login-password", DOCTOR_PASSWORD)
        print("✓ Doctor logged in")

        driver.get(f"{BASE_URL}/dashboard/doctor/appointments?filter=Pending")

        # Wait for an Accept button (proves request card is visible)
        accept_btn = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Accept')]")
            )
        )
        print("✓ Pending request visible to doctor")

        accept_btn.click()
        print("✓ Doctor clicked Accept")

        # Verify — the card text should now show "Confirmed"
        wait_for_text(driver, "Confirmed")
        print("✓ Appointment accepted! Status shows Confirmed")

        print("\n" + "=" * 60)
        print("✅ E2E FLOW VERIFIED: Patient books → Doctor accepts")
        print("=" * 60)


class TestAppointmentWithDecline:
    """Patient books → Doctor declines with reason."""

    def test_doctor_declines_appointment(self, driver):
        patient_books_appointment(driver)
        logout(driver)

        # ── Doctor declines ──
        login(driver,
              "#login-role-doctor",
              "#doctor-login-phone", DOCTOR_PHONE,
              "#doctor-login-password", DOCTOR_PASSWORD)
        driver.get(f"{BASE_URL}/dashboard/doctor/appointments?filter=Pending")

        wait = WebDriverWait(driver, 15)
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Decline')]")
        )).click()
        print("✓ Clicked Decline")

        # Modal: pick a reason
        wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//*[contains(text(),'Schedule Conflict')]")
        )).click()
        print("✓ Selected decline reason")

        # Confirm — button text is "Confirm Cancellation"
        driver.find_element(
            By.XPATH, "//button[contains(text(),'Confirm Cancellation')]"
        ).click()
        print("✓ Doctor declined the appointment")

        # Verify
        wait_for_text(driver, "Rejected")
        print("✓ Appointment status shows Rejected")

        print("\n" + "=" * 60)
        print("✅ DECLINE FLOW VERIFIED: Patient books → Doctor declines")
        print("=" * 60)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--headed"])
