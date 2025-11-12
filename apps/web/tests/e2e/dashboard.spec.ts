import { test, expect } from "@playwright/test";
import { setupDashboardMocks } from "./utils/mockApi";

const DASHBOARD_URL = "/";

function formatForDateTimeLocal(date: Date) {
  const tzless = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return tzless.toISOString().slice(0, 16);
}

test.describe("Dashboard", () => {
  test("renders the primary dashboard sections", async ({ page }) => {
    await setupDashboardMocks(page);

    await page.goto(DASHBOARD_URL);
    await page.waitForResponse((response) =>
      response.url().includes("/v1/users/me") && response.request().method() === "GET",
    );

  await expect(page.getByRole("heading", { level: 2, name: "Your profile" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Bands", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Events", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Song ideas", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Setlists", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Venues", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Earnings", exact: true })).toBeVisible();

  await expect(page.getByText("Band Leader", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /The Skylines/ })).toBeVisible();
  await expect(page.locator("#overview").getByText("Neighborhood Festival")).toBeVisible();
  await expect(page.locator("#song-ideas").getByText("Mountain Echo")).toBeVisible();
  await expect(page.locator("#venues").getByText("Sunset Lounge")).toBeVisible();
  await expect(page.locator("#earnings").getByText("Festival guarantee")).toBeVisible();
  });

  test("supports creating core artefacts from the dashboard", async ({ page }) => {
    await setupDashboardMocks(page);

    await page.goto(DASHBOARD_URL);
    await page.waitForResponse((response) =>
      response.url().includes("/v1/bands") && response.request().method() === "GET",
    );

    await page.getByRole("button", { name: "New band" }).click();
    const bandForm = page.locator("form", { hasText: "Create band" });
    await bandForm.getByLabel("Name").fill("Downtown Collective");
    await bandForm.getByLabel("Genre").fill("Indie Rock");
    await bandForm.getByLabel("Description").fill("High-energy city pop quartet");
    await bandForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: "Downtown Collective" })).toBeVisible();

    await page.getByRole("button", { name: "Schedule event" }).click();
    const eventForm = page.locator("form", { hasText: "New event" });
    await eventForm.getByLabel("Title").fill("Sunrise Showcase");
    const eventDate = formatForDateTimeLocal(new Date(Date.now() + 1000 * 60 * 60 * 48));
    await eventForm.getByLabel("Starts at").fill(eventDate);
    await eventForm.getByLabel("Notes").fill("Doors at 7pm");
    await eventForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Sunrise Showcase")).toBeVisible();

    await page.getByRole("button", { name: "New idea" }).click();
    const ideaForm = page.locator("form", { hasText: "Capture idea" });
    await ideaForm.getByLabel("Title").fill("Glass Horizon");
    await ideaForm.getByLabel("Notes").fill("Dreamy verse with syncopated hook");
    await ideaForm.getByLabel("Tags (comma separated)").fill("dream, hook");
    await ideaForm.getByLabel("Status").selectOption("SHARED");
    await ideaForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Glass Horizon")).toBeVisible();
    await expect(page.getByText("Shared").first()).toBeVisible();

  await page.getByRole("button", { name: "New setlist" }).click();
  const setlistForm = page.locator("form", { hasText: "Create setlist" });
    await setlistForm.getByLabel("Title").fill("Album Launch Set");
    await setlistForm.getByLabel("Description").fill("45 minute feature");
    await setlistForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Album Launch Set")).toBeVisible();

  const setlistsSection = page.locator("#setlists");
  await setlistsSection.getByRole("button", { name: /View$/ }).first().click();
  const addSongForm = setlistsSection.locator("form", { hasText: "Add song" }).first();
  await expect(addSongForm).toBeVisible();
    await addSongForm.getByLabel("Title").fill("First Light");
    await addSongForm.getByLabel("Artist").fill("Downtown Collective");
    await addSongForm.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("First Light")).toBeVisible();

    await page.getByRole("button", { name: "New venue" }).click();
    const venueForm = page.locator("form", { hasText: "Add venue" });
    await venueForm.getByLabel("Name").fill("Harbor Stage");
    await venueForm.getByLabel("City").fill("Boston");
    await venueForm.getByLabel("State/Province").fill("MA");
    await venueForm.getByLabel("Country").fill("USA");
    await venueForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Harbor Stage")).toBeVisible();

    await page.getByRole("button", { name: "Log earning" }).click();
    const earningForm = page.locator("form", { hasText: "Log earning" });
    await earningForm.getByLabel("Amount").fill("750");
    await earningForm.getByLabel("Currency").fill("USD");
    await earningForm.getByLabel("Description").fill("Pre-show deposit");
    await earningForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Pre-show deposit")).toBeVisible();
  });
});
