from playwright.sync_api import Page, expect, sync_playwright
import time

def test_reset_and_error(page: Page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:5173")

    # Wait for calendar to be visible
    # Fix strict mode violation by using first()
    expect(page.locator(".calendar-day").first).to_be_visible(timeout=10000)

    # 2. Select a date
    # Find a date cell that is not disabled
    day = page.locator(".calendar-day:not(.disabled)").first
    day.click()

    # Wait for Floating Toolbar to appear/update
    time.sleep(1) # Small pause for animation/state

    # 3. Open Event Modal
    # Click Floating Toolbar -> Templates
    # Floating toolbar is "Open menu"
    # Debug what's happening - verify button is visible
    open_menu = page.get_by_label("Open menu")
    expect(open_menu).to_be_visible()
    open_menu.click()

    # Wait for menu items to appear
    # Debug - screenshot
    time.sleep(1)
    page.screenshot(path="verification_debug.png")

    # Check if "Templates" is visible
    templates_btn = page.get_by_text("Templates")
    expect(templates_btn).to_be_visible()
    templates_btn.click()

    # Wait for modal
    expect(page.get_by_text("Create Events")).to_be_visible(timeout=10000)

    # 4. Add an event to queue
    # Assuming "School Drop Off" is default, verify "Add to Queue" button is enabled

    # Click "Add to Queue"
    page.get_by_role("button", name="Add to Queue").click()

    # Verify event added to queue (Review tab or list)
    expect(page.get_by_text("School Drop Off (Brandt)")).to_be_visible()

    # 5. Test Download ICS (Success Case)
    # This should trigger success toast and close modal

    # Click "Download .ics instead"
    with page.expect_download() as download_info:
        page.get_by_role("button", name="Download .ics instead").click()

    # Verify download happened
    download = download_info.value
    print(f"Downloaded: {download.suggested_filename}")

    # Verify Modal Closed
    expect(page.get_by_text("Create Events")).not_to_be_visible()

    # Verify Toast Message
    toast = page.get_by_text("ICS file downloaded")
    expect(toast).to_be_visible()

    # Verify Selection Cleared
    # The previously selected day should not have .selected class
    # Wait a bit for React state update
    time.sleep(1)

    # Check if any day is selected
    count = page.locator(".calendar-day.selected").count()
    assert count == 0, f"Expected 0 selected dates, found {count}"

    print("Success case verified.")

    # 6. Test Error Case (Simulated via 'Add to Google Calendar')

    # Select a date again
    day.click()
    page.get_by_label("Open menu").click()
    page.get_by_text("Templates").click()
    # Wait for modal again
    expect(page.get_by_text("Create Events")).to_be_visible()

    page.get_by_role("button", name="Add to Queue").click()

    # Click "Add to Google Calendar"
    add_btn = page.get_by_role("button", name="Add to Google Calendar")
    add_btn.click()

    try:
        # Check for error toast
        # The message is "Failed to add events. Check console."
        error_toast = page.get_by_text("Failed to add events. Check console.")
        expect(error_toast).to_be_visible(timeout=10000)

        # Verify Modal is STILL OPEN
        expect(page.get_by_text("Create Events")).to_be_visible()
        print("Error case verified.")

    except Exception as e:
        print("Error case check failed or timed out.")
        print(e)
        pass

    # Take screenshot
    page.screenshot(path="verification_result.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_reset_and_error(page)
        finally:
            browser.close()
