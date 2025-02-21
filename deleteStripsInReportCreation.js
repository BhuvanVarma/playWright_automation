const { chromium } = require('playwright');

(async () => {
    const startTime = Date.now(); // ⏳ Start time
    const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    await page.goto('https://cms.qa.vigocare.com/');
    await page.fill("//input[@id='user-email']", 'gk.ecg@vigocare.com');
    await page.fill("//input[@id='user-password']", 'pass1234');
    await page.click("//span[@class='el-checkbox__inner']");
    await page.click("//span[normalize-space()='Sign in']");
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    await page.fill("//input[@placeholder='Search for a Case ID & Patient Name']", 'VC001VP15058');
    await page.click("//span[normalize-space()='SEARCH']");
    await page.waitForTimeout(2000);
    await page.click("(//span[normalize-space()='View'])[2]");
    await page.waitForTimeout(2000);
    await page.waitForSelector("//a[contains(text(),'Report Creation')]", { state: 'visible' });
    await page.click("//a[contains(text(),'Report Creation')]");

    await page.waitForSelector("//button[normalize-space()='Selected Strips']", { state: 'visible' });
    await page.click("//button[normalize-space()='Selected Strips']");

    // Loop until the delete button is no longer visible
    await page.waitForTimeout(2000);
    await page.waitForSelector("(//div[10]//i[1]//*[name()='svg'])[1]", { state: 'visible' });
    while (await page.locator("(//div[10]//i[1]//*[name()='svg'])[1]").isVisible()) {
        await page.waitForSelector("(//div[10]//i[1]//*[name()='svg'])[1]", { state: 'visible' });
        await page.click("(//div[10]//i[1]//*[name()='svg'])[1]");
        await page.waitForTimeout(500); // Short delay to allow UI updates
    }

    console.log("✅ All strips deleted!");

    const endTime = Date.now(); // ⏳ Capture end time AFTER loop
    const timeTakenSec = (endTime - startTime) / 1000; // Convert to seconds
    const minutes = Math.floor(timeTakenSec / 60);
    const seconds = (timeTakenSec % 60).toFixed(2);
    console.log(`🕒 Total Time Taken: ${minutes} min and ${seconds} sec`);

    await browser.close();
})();
