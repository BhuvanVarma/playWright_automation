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
    await page.click("(//span[normalize-space()='View'])");
    await page.click("//a[normalize-space()='Analysis']");

    const SelectStripFromGraph = async () => {
        const rect = await page.waitForSelector('rect.rect-scatterplot', { visible: true, timeout: 30000 }).catch(() => null);
        if (rect) {
            const box = await rect.boundingBox();
            if (box) {
                const randomX = Math.round(box.x + Math.random() * box.width);
                const randomY = Math.round(box.y + Math.random() * box.height);
                await page.mouse.click(randomX, randomY);
                console.log(`🎯 Clicked randomly at: (${randomX}, ${randomY})`);
            }
        }
    };

    const dropdownOptions = [
        { optionName: "Max HR", value: "150", comment: "Maximum heart rate" },
        { optionName: "Min HR", value: "60", comment: "Minimum heart rate" },
        { optionName: "Pause", comment: "Pause detected" },
        { optionName: "AV block", subOption: ["2nd degree Mobitz I", "2nd degree Mobitz II", "Advanced AV Block(high grade)", "Complete AV Block(3rd degree)"], comment: "Atrioventricular block" },
        { optionName: "AFib / Flutter", comment: "Atrial fibrillation or flutter" },
        { optionName: "Other SVT", comment: "Other supraventricular tachycardia" },
        { optionName: "PVC", comment: "Premature ventricular contraction" },
        { optionName: "PSVC", comment: "Paroxysmal supraventricular tachycardia" },
        { optionName: "VT", comment: "Ventricular tachycardia" },
        { optionName: "Patient Events", subOption: ["Shortness of breath"], comment: "Patient Events" },
        { optionName: "Manual", comment: "Manual entry" },
    ];

    const repeatCount = 5; // 🔄 Change this to repeat each entry `n` times

    for (const { optionName, value, comment, subOption } of dropdownOptions) {
        for (let i = 0; i < repeatCount; i++) { // 🔄 Repeat each option `repeatCount` times
            console.log(`🔄 Iteration ${i + 1} for ${optionName}`);

            await SelectStripFromGraph();
            await page.waitForTimeout(1000);
            await page.click("//button[@title='Add New Episode']");
            await page.waitForTimeout(1000);
            await page.click("//span[contains(text(),'Max HR')]");
            await page.waitForTimeout(1000);

            if (optionName === "VT" || optionName === "Patient Events" || optionName === "Manual") {
                const dropDownElement = await page.waitForSelector("//span[contains(text(),'Min HR')]");
                await dropDownElement.hover();
                await page.mouse.wheel(0, 200);
                await page.waitForTimeout(1000);
                await page.click(`//span[normalize-space()='${optionName}']`);
                await page.waitForTimeout(1000);
            } else {
                await page.click(`//span[contains(text(),'${optionName}')]`);
                await page.waitForTimeout(1000);
            }

            switch (optionName) {
                case "Max HR":
                case "Min HR":
                    await page.fill("//input[@placeholder='bpm']", value);
                    await page.fill("//input[@placeholder='Comment']", comment);
                    await page.click("//span[normalize-space()='Add']");
                    console.log(`✅ Added ${optionName} (${i + 1}/${repeatCount})`);
                    break;
                case "Pause":
                case "AFib / Flutter":
                case "Other SVT":
                case "PSVC":
                case "PVC":
                case "VT":
                case "Manual":
                    await page.fill("//input[@placeholder='Comment']", comment);
                    await page.click("//span[normalize-space()='Add']");
                    console.log(`✅ Added ${optionName} (${i + 1}/${repeatCount})`);
                    break;
                case "AV block":
                    for (const sub of subOption) {
                        console.log(`🔹 Processing ${sub} (${i + 1}/${repeatCount})`);

                        if (sub === "2nd degree Mobitz II" || sub === "Advanced AV Block(high grade)" || sub === "Complete AV Block(3rd degree)") {
                            await page.waitForSelector("//button[@title='Add New Episode']", { visible: true });
                            await page.click("//button[@title='Add New Episode']");
                            await page.waitForTimeout(1000);
                            await page.waitForSelector("//span[contains(text(),'Max HR')]", { visible: true });
                            await page.click("//span[contains(text(),'Max HR')]");
                            await page.waitForSelector("//span[contains(text(),'AV block')]", { visible: true });
                            await page.click("//span[contains(text(),'AV block')]");
                        }

                        await page.waitForSelector("//span[normalize-space()='Select']", { visible: true });
                        await page.click("//span[normalize-space()='Select']");
                        await page.waitForSelector(`//span[normalize-space()='${sub}']`, { visible: true });
                        await page.click(`//span[normalize-space()='${sub}']`);
                        await page.fill("//input[@placeholder='Comment']", comment);
                        await page.click("//span[normalize-space()='Add']");

                        console.log(`✅ Added ${sub} under AV Block (${i + 1}/${repeatCount})`);
                        await page.waitForTimeout(1000);
                    }
                    break;
                case "Patient Events":
                    await page.waitForSelector("//span[normalize-space()='Symptom']", { visible: true });
                    await page.click("//span[normalize-space()='Symptom']");
                    await page.waitForTimeout(1000);
                    await page.waitForSelector("//span[normalize-space()='Shortness of breath']", { visible: true });
                    await page.click("//span[normalize-space()='Shortness of breath']");
                    await page.fill("//input[@placeholder='Comment']", comment);
                    await page.click("//span[normalize-space()='Add']");
                    console.log(`✅ Added ${subOption} under Patient Events (${i + 1}/${repeatCount})`);
            }

            await page.waitForTimeout(1000);
        }
    }

    const endTime = Date.now(); // ⏳ Capture end time AFTER loop
    const timeTakenSec = (endTime - startTime) / 1000; // Convert to seconds
    const minutes = Math.floor(timeTakenSec / 60);
    const seconds = (timeTakenSec % 60).toFixed(2);
    console.log(`🕒 Total Time Taken: ${minutes} min and ${seconds} sec`);

    await browser.close();
})();
