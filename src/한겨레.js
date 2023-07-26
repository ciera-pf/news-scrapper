import { getTopicsFromArticle, getArticleSummary } from './openai_api.js'
import { sleep, writeFile } from './utils.js'
import cheerio from 'cheerio'
import axios from 'axios'

const NEWS_URLS = [
    "https://www.hani.co.kr/arti/society/labor/1100937.html",
    "https://www.hani.co.kr/arti/society/labor/1100924.html",
    "https://www.hani.co.kr/arti/society/society_general/1100804.html",
    "https://www.hani.co.kr/arti/economy/economy_general/1100684.html",
    "https://www.hani.co.kr/arti/society/labor/1100084.html",
    "https://www.hani.co.kr/arti/society/labor/1100023.html",
    "https://www.hani.co.kr/arti/society/society_general/1099948.html",
]

async function main() {
    const results = []
    for await (const link_url of NEWS_URLS) {
        console.log(link_url)
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

        const { choices: topicChoices } = await getTopicsFromArticle(result.title, result.content)
        const { choices: summaryChoices } = await getArticleSummary(result.title, result.content)
        result.topics = JSON.parse(topicChoices[0].message.function_call.arguments).topics;
        result.summary = JSON.parse(summaryChoices[0].message.function_call.arguments).summary;
        sleep(1000)

        results.push(result);
    }

    writeFile('scrap.json', JSON.stringify(results))
}

main();
