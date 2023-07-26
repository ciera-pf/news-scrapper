import * as cheerio from 'cheerio'
import axios from 'axios'
import fs, { link } from 'fs'

const fileName = '스타벅스_트렌타_용량_출시'

const NEWS_URLS = [
    'https://www.hani.co.kr/arti/economy/consumer/1099764.html',
    'https://www.chosun.com/economy/market_trend/2023/07/12/UGBAOWLAQRDHDMBUA2QKX2M3QI/',
    'https://www.hankookilbo.com/News/Read/A2023071213550003435'
]


function convertDateTime(dateTimeStr, timeZone = 'Asia/Seoul') {
    // 문자열을 Date 객체로 변환
    let date = new Date(dateTimeStr);

    // 시간대에 맞게 날짜와 시간을 조정
    let formatted = date.toLocaleString('en-US', { timeZone, hour12: false });

    // 'MM/DD/YYYY, HH:mm:ss' 형식의 문자열을 'YYYY-MM-DDTHH:mm:ss+09:00' 형식으로 변환
    let parts = formatted.split(', ');
    let dateParts = parts[0].split('/');
    return `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}T${parts[1]}+09:00`;
}

const hani = async (link_url) => {
    const result = {
        media: "한겨레",
        link_url,
        topics: [""]
    }

    const { data } = await axios.get(link_url)

    const $ = cheerio.load(data);

    result.title = $('#article_view_headline .title').text()
    result.author = $('.kiza-info>.name strong').html()?.replace(' 기자', '') || ''
    result.published_at = convertDateTime(new Date($('#article_view_headline .date-time>span:nth-child(1)').html().slice(12)).toISOString());
    result.content = $('.article-text>.article-text-font-size>.text').text().replace(/\t/g, '')

    return result;
}

const chosun = async (link_url) => {
    const result = {
        media: "조선일보",
        link_url,
        topics: [""]
    }

    const { data } = await axios.get(link_url)

    const $ = cheerio.load(data);

    result.title = data.match(/<meta property="og:title" content="([^"]*)"/)[1]
    result.author = data.match(/_sf_async_config.authors = "([^"]+)";/)?.[1].replace(' 기자', '') || ''
    result.published_at = convertDateTime(new Date(data.match(/<meta name="article:published_time" content="([^"]*)"/)[1]).toISOString());
    result.content = data.match(/\{"_id":"[^"]+","content":"[^"]+","type":"text"}/g).map((el) => {
        return JSON.parse(el).content
    }).join('\n')

    return result;
}

const hankookilbo = async (link_url) => {
    const result = {
        media: "한국일보",
        link_url,
        topics: [""]
    }

    const { data } = await axios.get(link_url)

    const $ = cheerio.load(data);

    result.title = $('title').text()
    result.author = $('div.info div.name-box a span.nm').html();
    result.published_at = convertDateTime(new Date($('dl.wrt-text dd').html()).toISOString());
    result.content = $('div.col-main[itemprop="articleBody"] > p').text()

    return result;
}

async function main() {
    console.log('기사 개수: ', NEWS_URLS.length)
    const results = await Promise.all(NEWS_URLS.map(async (link_url) => {
        if (/www\.hani\.co\.kr/.test(link_url)) {
            return await hani(link_url);
        } else if (/www\.chosun\.com/.test(link_url)) {
            return await chosun(link_url);
        } else if (/www\.hankookilbo\.com/.test(link_url)) {
            return await hankookilbo(link_url);
        }
    }))

    results.sort((a, b) => new Date(a.published_at) - new Date(b.published_at))

    writeFile(`${fileName}.json`, JSON.stringify(results))
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