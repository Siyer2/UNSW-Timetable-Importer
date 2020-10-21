const puppeteer = require('puppeteer');
require('dotenv').config();

function login() {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://sso.unsw.edu.au/cas/login?service=https%3A%2F%2Fmy.unsw.edu.au%2Fportal%2FadfAuthentication`;

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'load' });

            //==== Login ====//
            // Click on Alumni & Ex-Staff Login
            await page.click('#alumni');
            await page.waitForSelector('#alumni-login', { visible: true });

            await page.type('input#username.form-control.alumni-username', process.env.UNSW_USERNAME);
            await page.type('#inputAlumniPassword', process.env.UNSW_PASSWORD);
            await page.click('#alumni-form > div:nth-child(6) > div.col-6.pr-1 > button');
            await page.waitForNavigation();
            console.log("Successfully signed in...");

            //==== Get timetable ====//
            // Click 'My Student Profile'
            await page.click(`a[id='pt1:pt_gl3j_id_1']`); // Need to check whether sign in was successful here
            await page.waitForNavigation();
            console.log("Successfully clicked My Student Profile...");

            // Click 'Class Timetable'
            const [button] = await page.$x("//a[contains(., 'Class Timetable')]");
            button.click();
            await page.waitForNavigation();
            console.log("Successfully clicked my Class Timetable...");

            // Get course information
            const timetablePromise = new Promise(async (resolve, reject) => {
                try {
                    page.on('response', async (response) => {
                        const timetableJSON = await response.json();
                        resolve(timetableJSON);
                    });

                } catch (ex) {
                    reject(ex);
                }
            });

            const timetable = await timetablePromise;
            console.log(timetable);
            resolve(timetable);
        } catch (ex) {
            reject(ex);
        }
    });
}

(async () => {
    try {
        await login();

        return;
    } catch (e) {
        
    }
})();