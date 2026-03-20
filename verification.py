from playwright.sync_api import sync_playwright

def verify_tray(page):
    page.goto("http://localhost:5173/")
    page.evaluate("localStorage.setItem('appMode', 'work_only')")
    page.reload()

    page.wait_for_selector("text='You go work?'")

    # We are using an infinite swipe container where there's a 300% width container.
    # We need to target the dates that are actually in the middle (current month)
    # The middle container is the second one out of 3.
    # Actually wait, maybe it's easier to just use page.locator("div.w-1\\/3").nth(1).locator(".calendar-day").nth(10)

    middle_month = page.locator("div.w-1\\/3").nth(1)
    days = middle_month.locator(".calendar-day")

    days.nth(10).click(force=True)
    days.nth(11).click(force=True)

    page.wait_for_selector("text='Add 2 Work Shifts'")
    page.screenshot(path="verification.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify_tray(page)
    browser.close()