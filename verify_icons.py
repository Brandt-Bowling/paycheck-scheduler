import time
from playwright.sync_api import sync_playwright, expect

def verify_icons(page):
    # Set viewport to mobile size as this is a mobile-first app
    page.set_viewport_size({"width": 375, "height": 667})

    # Go to app
    page.goto("http://localhost:5173")

    # Wait for hydration
    page.wait_for_timeout(2000)

    # Check Calendar Header Icons (Settings)
    # The settings button is in the header. We look for the material-symbols-outlined span.
    settings_icon = page.locator("header button span.material-symbols-outlined")
    expect(settings_icon).to_be_visible()
    expect(settings_icon).to_have_text("settings")

    # Check Month Navigation Icons (Chevrons)
    # Left chevron
    left_chevron = page.locator("button[aria-label='Previous month'] span.material-symbols-outlined")
    expect(left_chevron).to_be_visible()
    expect(left_chevron).to_have_text("chevron_left")

    # Right chevron
    right_chevron = page.locator("button[aria-label='Next month'] span.material-symbols-outlined")
    expect(right_chevron).to_be_visible()
    expect(right_chevron).to_have_text("chevron_right")

    # Take a screenshot of the main view (Work Only mode default)
    page.screenshot(path="verification_calendar_work_mode.png")

    # Check FAB in Work Only mode
    # We need to select a date first for FAB to appear?
    # Memory says: "The FloatingActionButton component is only visible after a date is selected."
    # So we must select a date.

    # Select a date (e.g., the 15th)
    page.get_by_text("15").first.click()
    page.wait_for_timeout(500)

    # Now FAB should be visible
    fab_button = page.locator("button[aria-label='Add Work Event']")
    expect(fab_button).to_be_visible()
    fab_icon = fab_button.locator("span.material-symbols-outlined")
    expect(fab_icon).to_have_text("calendar_today")

    # Now switch to Standard Mode to check other icons
    page.locator("header button[aria-label='Settings']").click()
    page.wait_for_timeout(500)

    # Switch to Standard
    page.get_by_text("Standard").click()
    page.wait_for_timeout(500)

    # Close Settings
    # Try finding the close button. In the screenshot it has an 'x' but might be using 'close' symbol if I updated it?
    # I did NOT update Settings modal in this plan. It probably uses `&times;` or a custom icon I didn't touch?
    # The screenshot shows an 'x'.
    # I'll try to find the close button by aria-label if possible, or just click the backdrop?
    # The screenshot shows a close button top right.
    # Let's try clicking the backdrop to close.
    # Backdrop is .fixed.inset-0.bg-black
    # But usually easier to find the close button.
    # Let's assume there is a close button.
    # In the screenshot, there is an 'x'.
    # I'll try generic selector for the close button in the modal.
    # The modal seems to be "Settings".
    page.locator("text=Settings").first
    # Click the close button inside the modal container.
    # The close button is usually absolute positioned top right.
    # Or just reload the page to be safe and clean state? No, mode is persisted.
    # Let's reload.
    page.reload()
    page.wait_for_timeout(1000)

    # Check we are in Standard mode
    # Select a date
    page.get_by_text("15").first.click()
    page.wait_for_timeout(500)

    # FAB should now be the '+' icon
    add_fab = page.locator("button[aria-label='Open menu']")
    expect(add_fab).to_be_visible()
    add_fab_icon = add_fab.locator("span.material-symbols-outlined")
    expect(add_fab_icon).to_have_text("add")

    # Expand menu
    add_fab.click()
    page.wait_for_timeout(500)

    # Check Pay Estimator icon
    pay_fab = page.locator("button[aria-label='Pay Estimator']")
    expect(pay_fab).to_be_visible()
    pay_icon = pay_fab.locator("span.material-symbols-outlined")
    expect(pay_icon).to_have_text("attach_money")

    # Check Templates icon
    templ_fab = page.locator("button[aria-label='Templates']")
    expect(templ_fab).to_be_visible()
    templ_icon = templ_fab.locator("span.material-symbols-outlined")
    expect(templ_icon).to_have_text("calendar_today")

    # Open Pay Estimator to check Close icon
    pay_fab.click()
    page.wait_for_timeout(500)

    # Check Close icon in PaycheckModal
    close_paycheck = page.locator("button[aria-label='Close paycheck settings'] span.material-symbols-outlined")
    expect(close_paycheck).to_be_visible()
    expect(close_paycheck).to_have_text("close")

    page.screenshot(path="verification_complete.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_icons(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()
