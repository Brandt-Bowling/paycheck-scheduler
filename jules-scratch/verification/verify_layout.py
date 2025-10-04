from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # Wait for the calendar to be visible
    expect(page.locator(".grid.grid-cols-7")).to_be_visible()

    # Select a few dates to make the FAB appear
    # Using a more specific locator to target the clickable day element
    page.locator(".calendar-day", has_text="15").click()
    page.locator(".calendar-day", has_text="16").click()
    page.locator(".calendar-day", has_text="17").click()

    # Wait for the FAB to be visible
    expect(page.get_by_label("Open menu")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)