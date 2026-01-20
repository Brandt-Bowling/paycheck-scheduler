import os
from playwright.sync_api import sync_playwright

def verify_fab_visible():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        # Set localStorage for work_only mode
        page.add_init_script("""
            localStorage.setItem('appMode', 'work_only');
        """)

        print("Navigating to app...")
        page.goto("http://localhost:5173")
        page.wait_for_timeout(2000)

        # Check FAB without selecting date
        print("Checking FAB...")
        fab = page.locator("button[aria-label='Add Work Event']")
        if fab.count() > 0:
            print("SUCCESS: FAB found immediately.")
            if fab.is_visible():
                print("SUCCESS: FAB is visible.")
            else:
                print("FAILURE: FAB is in DOM but not visible.")
        else:
            print("FAILURE: FAB not found.")

        print("Taking screenshot...")
        page.screenshot(path="fab_visible.png")
        browser.close()

if __name__ == "__main__":
    verify_fab_visible()
