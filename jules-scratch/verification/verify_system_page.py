from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in to the application
    page.goto("http://localhost:5173/login")
    page.wait_for_selector('button:has-text("Login")', timeout=60000)
    page.get_by_label("Username").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url("http://localhost:5173/dashboard")

    # Navigate to the system page
    page.goto("http://localhost:5173/dashboard/system")

    # Wait for the recent activities section to load
    expect(page.get_by_text("Recent Activities")).to_be_visible()

    # Take a screenshot of the recent activities section
    page.locator(".bg-white.rounded-2xl.shadow-sm.border.border-gray-100\\/50.p-8 >> nth=2").screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)