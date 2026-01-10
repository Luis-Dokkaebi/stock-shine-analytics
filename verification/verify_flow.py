from playwright.sync_api import sync_playwright, expect

def verify_warehouse_flow(page):
    # Go to Sales Page
    print("Navigating to Sales page...")
    page.goto("http://localhost:3000/sales")

    # Wait for page load
    page.wait_for_load_state("networkidle")

    # Verify Title
    expect(page.get_by_role("heading", name="Gestión de Ventas")).to_be_visible()

    # Search for Order
    print("Searching for order...")
    page.get_by_placeholder("Enter O.R. Number").fill("OR-2024-001")
    page.get_by_role("button", name="Search O.R.").click()

    # Verify Order Details appear
    expect(page.get_by_text("Technician: Juan Perez")).to_be_visible()

    # Verify Logic
    # Item 1: Monitor LED 24" - Stock 45 (Green) -> Should have Requisition button
    # Item 2: Air Compressor - Stock 0 (Red) -> Should have Order Plant button

    monitor_row = page.locator("#row-101-1")
    compressor_row = page.locator("#row-101-4")

    expect(monitor_row).to_contain_text("Monitor LED 24")
    expect(monitor_row).to_contain_text("Available")
    expect(monitor_row.get_by_role("button", name="Requisition")).to_be_visible()

    expect(compressor_row).to_contain_text("Air Compressor")
    expect(compressor_row).to_contain_text("Missing")
    expect(compressor_row.get_by_role("button", name="Order Plant")).to_be_visible()

    print("Verifying Requisition animation/logic...")
    # Click Requisition
    monitor_row.get_by_role("button", name="Requisition").click()

    # Wait for animation/toast
    page.wait_for_timeout(1000)

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/sales_flow.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_warehouse_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
