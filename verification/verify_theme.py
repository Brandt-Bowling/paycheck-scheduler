
from playwright.sync_api import sync_playwright

def verify_theme_colors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Serve runs on port 3000 by default (from previous step's serve command)
        page.goto("http://localhost:3000")

        # Verify Light Mode Theme Color
        light_theme = page.locator('meta[name="theme-color"][media="(prefers-color-scheme: light)"]').get_attribute("content")
        print(f"Light Theme Color: {light_theme}")
        assert light_theme == "#f1f5f9"

        # Verify Dark Mode Theme Color
        dark_theme = page.locator('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]').get_attribute("content")
        print(f"Dark Theme Color: {dark_theme}")
        assert dark_theme == "#0f172a"

        page.screenshot(path="verification/pwa_theme_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_theme_colors()
