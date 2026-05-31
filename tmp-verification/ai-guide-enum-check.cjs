const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await context.addCookies([
    {
      name: "demo_student_id",
      value: "S001",
      domain: "localhost",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "demo_login",
      JSON.stringify({
        role: "student",
        username: "S001",
        name: "学生A",
        studentId: "S001",
        timestamp: Date.now(),
      }),
    );
  });

  await page.goto("http://localhost:3000/ai-guide", { waitUntil: "networkidle" });
  const itemReportButton = page.getByRole("button", { name: /查看专项提升/ }).first();
  if (await itemReportButton.isVisible()) {
    await itemReportButton.click();
  } else {
    await page.getByRole("button", { name: /查看正式体测分析|查看已有分析/ }).first().click();
  }
  await page.getByText("体测分析").waitFor({ state: "visible" });

  const bodyText = await page.locator("body").innerText();
  const rawTokenPattern = /\b(vital_capacity|standing_long_jump|sit_and_reach|pull_up|sit_up|1000m_run|800m_run|50m_run|excellent|good|pass|improve)\b/;
  const match = bodyText.match(rawTokenPattern);
  await browser.close();
  if (match) {
    throw new Error(`Raw enum leaked to UI: ${match[0]}`);
  }
  console.log("AI guide enum display check passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
