
from playwright.sync_api import sync_playwright

def verify_pwa_metadata_prod():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Serve runs on port 3000 by default
        page.goto("http://localhost:3000")

        # Verify Title
        title = page.title()
        print(f"Page Title: {title}")
        assert title == "You Go Work?"

        # Verify Manifest Link (Should be present in build)
        manifest = page.locator('link[rel="manifest"]').get_attribute("href")
        print(f"Manifest: {manifest}")
        assert manifest == "/manifest.webmanifest"

        page.screenshot(path="verification/pwa_verification_prod.png")
        browser.close()

if __name__ == "__main__":
    verify_pwa_metadata_prod()
