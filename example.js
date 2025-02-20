const { chromium } = require('playwright');

(async () => {
  // Launch browser and maximize the window
    const browser = await chromium.launch({
        headless: false, // Set to false to see the browser
        args: ['--start-maximized'] // Maximizes the window
    });

    const context = await browser.newContext({
        viewport: null // Ensures Playwright uses full window size
    });
  const page = await context.newPage();

  // Navigate to vigo CMS
  await page.goto('https://cms.qa.vigocare.com/');

  // Wait for and fill in the email input
  await page.waitForSelector("//input[@id='user-email']", { visible: true });
  await page.fill("//input[@id='user-email']", 'gk.ecg@vigocare.com');

  // Wait for and fill in the password input (fixed the XPath)
  await page.waitForSelector("//input[@id='user-password']", { visible: true });
  await page.fill("//input[@id='user-password']", 'pass1234');

  // Wait for and click the checkbox (agree to terms or something similar)
  await page.waitForSelector("//span[@class='el-checkbox__inner']", { visible: true });
  await page.click("//span[@class='el-checkbox__inner']");

  // Wait for and click the "Sign in" button
  await page.waitForSelector("//span[normalize-space()='Sign in']", { visible: true });
  await page.click("//span[normalize-space()='Sign in']");

  // Wait for the page to navigate after sign in
  //await page.waitForNavigation();
  await page.waitForNavigation({ waitUntil: 'networkidle' });


  await page.waitForSelector("//input[@placeholder='Search for a Case ID & Patient Name']", { visible: true });
  await page.fill("//input[@placeholder='Search for a Case ID & Patient Name']", 'VC001VP14643');
  await page.click("//span[normalize-space()='SEARCH']");
  await page.waitForTimeout(2000);
  await page.waitForSelector("(//span[normalize-space()='View'])[2]", { visible: true });
  await page.click("(//span[normalize-space()='View'])[2]");

  await page.waitForSelector("//a[normalize-space()='Analysis']", { visible: true });
  await page.click("//a[normalize-space()='Analysis']");

  // Log the current URL after the sign-in action
  console.log('Current URL after sign in:', page.url());

const SelectStripFromGraph = async() =>{
    // Wait for the <rect> element
    const rect = await page.waitForSelector('rect.rect-scatterplot', { visible: true, timeout: 30000 }).catch(() => null);

const box = await rect.boundingBox();
if (box) {
    // Generate random coordinates inside the <rect>
    const randomX = Math.round(box.x + Math.random() * box.width);
    const randomY = Math.round(box.y + Math.random() * box.height);

    await page.mouse.click(randomX, randomY);
    console.log(`🎯 Clicked randomly at: (${randomX}, ${randomY})`);
} else {
    console.log('⚠️ Bounding box not found. Element might be hidden or inside an iframe.');
}
}
    

// List of dropdown options
const dropdownOptions = [
    { optionName: "Max HR", value: "150", comment: "Maximum heart rate" },
    { optionName: "Min HR", value: "60", comment: "Minimum heart rate" },
    { optionName: "Pause", comment: "Pause detected" },
    { optionName: "AV block", subOption: [ "2nd degree Mobitz I", "2nd degree Mobitz II", "Advanced AV Block(high grade)", "Complete AV Block(3rd degree)"], comment: "Atrioventricular block" },
    { optionName: "AFib / Flutter", comment: "Atrial fibrillation or flutter" },
    { optionName: "Other SVT", comment: "Other supraventricular tachycardia" },
    { optionName: "PVC", comment: "Premature ventricular contraction" },
    { optionName: "PSVC", comment: "Paroxysmal supraventricular tachycardia" }
];

let NoOfEvents = 1;

for (let i = 0; i < dropdownOptions.length; i++){
    for (let j = 1; j <= NoOfEvents; j++) {
        const { optionName, value, comment, subOption } = dropdownOptions[i];

        SelectStripFromGraph()

        // Wait and Click "Add New Episode"
        await page.waitForSelector("//button[@title='Add New Episode']", { visible: true });
        await page.click("//button[@title='Add New Episode']");
        await page.waitForTimeout(1000); // Ensure modal loads

        // Ensure dropdown is visible
        const isDropdownVisible = await page.isVisible("//span[contains(text(),'Max HR')]");
        if (!isDropdownVisible) {
            console.log("⚠️ 'Max HR' dropdown is not visible! Retrying...");
        }

        // Scroll and Click dropdown
        await page.waitForSelector("//span[contains(text(),'Max HR')]");
        await page.click("//span[contains(text(),'Max HR')]");

        // Select the correct option
        await page.waitForSelector(`//span[contains(text(),'${optionName}')]`, { visible: true });
        await page.click(`//span[contains(text(),'${optionName}')]`);

        // Handle "Max HR" and "Min HR"
        if (optionName === "Max HR" || optionName === "Min HR") {
            SelectStripFromGraph()

            await page.waitForSelector("//input[@placeholder='bpm']", { visible: true });
            await page.fill("//input[@placeholder='bpm']", value);

            await page.waitForSelector("//input[@placeholder='Comment']", { visible: true });
            await page.fill("//input[@placeholder='Comment']", comment);

            // Add the episode
            await page.waitForSelector("//span[normalize-space()='Add']", { visible: true });
            await page.click("//span[normalize-space()='Add']");

            console.log(`✅ Successfully added: ${optionName}`);
        } else if(optionName === "Pause" || optionName === "AFib / Flutter" || optionName === "Other SVT" || optionName === "PSVC" || optionName === "PVC"){
            SelectStripFromGraph()
            await page.waitForSelector("//input[@placeholder='Comment']", { visible: true });
            await page.fill("//input[@placeholder='Comment']", comment);

            // Add the episode
            await page.waitForSelector("//span[normalize-space()='Add']", { visible: true });
            await page.click("//span[normalize-space()='Add']");

            console.log(`✅ Successfully added: ${optionName}`);
        }
        
        // Handle AV block sub-options
        else if (optionName === "AV block") {

            for (let k = 0; k < subOption.length; k++) {


                await page.waitForSelector("//span[normalize-space()='Select']", { visible: true });
                await page.click("//span[normalize-space()='Select']");

                console.log(`🔹 Trying to select sub-option: ${subOption[k]}`);
                await page.waitForSelector(`//span[normalize-space()='${subOption[k]}']`, { visible: true });
                await page.click(`//span[normalize-space()='${subOption[k]}']`);

                await page.waitForSelector("//input[@placeholder='Comment']", { visible: true });
                await page.fill("//input[@placeholder='Comment']", comment);

                // Add the episode
                await page.waitForSelector("//span[normalize-space()='Add']", { visible: true });
                await page.click("//span[normalize-space()='Add']");

                console.log(`✅ Successfully added: ${optionName}`);
            }
        }

        
    }
}

  // Close the browser
  //await browser.close();
})();





// const box = await rect.boundingBox();
// if (box) {
//     // Generate random coordinates inside the <rect>
//     const randomX = Math.round(box.x + Math.random() * box.width);
//     const randomY = Math.round(box.y + Math.random() * box.height);

//     await page.mouse.click(randomX, randomY);
//     console.log(`🎯 Clicked randomly at: (${randomX}, ${randomY})`);
// } else {
//     console.log('⚠️ Bounding box not found. Element might be hidden or inside an iframe.');
// }