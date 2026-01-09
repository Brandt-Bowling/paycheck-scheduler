
from playwright.sync_api import sync_playwright

def verify_pwa_metadata():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Verify Title
        title = page.title()
        print(f"Page Title: {title}")
        assert title == "You Go Work?"

        # Verify Theme Color
        theme_color = page.locator('meta[name="theme-color"]').get_attribute("content")
        print(f"Theme Color: {theme_color}")
        assert theme_color == "#f1f5f9"

        # Verify Favicon
        favicon = page.locator('link[rel="icon"]').get_attribute("href")
        print(f"Favicon: {favicon}")
        assert favicon == "/favicon.svg"

        # Verify PWA Icon
        pwa_icon = page.locator('link[rel="apple-touch-icon"]').get_attribute("href")
        print(f"PWA Icon: {pwa_icon}")
        assert pwa_icon == "/pwa-icon.svg"

        # Verify Manifest Link
        manifest = page.locator('link[rel="manifest"]').get_attribute("href")
        print(f"Manifest: {manifest}")
        # Note: VitePWA injects this at build time, but in dev it might be different or injected by the plugin.
        # In dev mode, the plugin injects a manifest link if configured correctly.

        page.screenshot(path="verification/pwa_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_pwa_metadata()
