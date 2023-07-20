const cheerio = require('cheerio');
const axios = require('axios');
const fetch = require('node-fetch');
const fs = require('fs')


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
    const results = []
    for await (const link_url of NEWS_URLS) {
        const result = {
            media: "한겨레",
            link_url,
            topics: [""]
        }

        const { data } = await axios.get(link_url)
        const $ = cheerio.load(data);

        result.title = $('#article_view_headline .title').text()
        result.author = $('.kiza-info>.name strong').html()
        result.datetime = new Date($('#article_view_headline .date-time>span:nth-child(1)').html().slice(12)).toISOString()
        result.content = $('.article-text>.article-text-font-size>.text').text().replace(/\t/g, '')

        results.push(result);
    }

    writeFile('scrap.json', JSON.stringify(results))
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