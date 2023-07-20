const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = require('node-fetch');
const fs = require('fs')


let driver;

const DRIVER_DIRECTORY = './chromedriver'
const NEWS_URLS = [
    'https://www.hani.co.kr/arti/society/labor/1100937.html',
    'https://www.hani.co.kr/arti/society/labor/1100924.html',
    'https://www.hani.co.kr/arti/society/society_general/1100804.html',
    'https://www.hani.co.kr/arti/economy/economy_general/1100684.html',
    'https://www.hani.co.kr/arti/society/labor/1100084.html',
    'https://www.hani.co.kr/arti/society/labor/1100023.html',
    'https://www.hani.co.kr/arti/society/society_general/1099948.html',
    'https://www.hani.co.kr/arti/society/labor/1099234.html',
]

async function main() {
    await init();

    const results = await Promise.all(NEWS_URLS.map(async (link_url) => {
        const result = {
            media: "한겨레",
            link_url,
            topics: [""]
        }

        await driver.get(link_url);
        await sleep(1000)

        result.title = await driver.findElement(By.css('#article_view_headline .title')).getText()
        result.author = await driver.findElement(By.css('.kiza-info>.name strong')).getText()
        result.datetime = new Date(await driver.findElement(By.css('#article_view_headline .date-time>span')).getText()).toISOString()
        result.content = await driver.findElement(By.css('.article-text>.article-text-font-size>.text')).getText()

        console.log(result)

        return result
    }))
    writeFile('scrap.json', JSON.stringify(results))
}

async function init() {
    const service = new chrome.ServiceBuilder(DRIVER_DIRECTORY);

    driver = await new Builder().forBrowser('chrome').setChromeService(service).build();
    if (!driver) {
        return console.error('driver not exist');
    }
}

function writeFile(fileName, data) {
    fs.writeFile(fileName, data, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


main();