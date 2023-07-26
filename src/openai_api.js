const axios = require('axios');

const OPENAI_BASE_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_KEY = '';


async function getTopicsFromArticle(title, contents) {

    const functions = [
        {
            "name": "getTopicsFromArticle",
            "description": "Get up to 5 key topics within 30 characters in a article",
            "parameters": {
                "type": "object",
                "properties": {
                    "topics": {
                        "type": "array",
                        "description": "up to 5 key topics within 30 characters",
                        "items": {
                            "type": "string"
                        }
                    },
                },
                "required": ["topics"],
            },
        }
    ]

    try {
        const { data } = await axios.post(OPENAI_BASE_URL, {
            messages: [{
                "role": "user", "content": `
            아래 기사에서 서로 다른 핵심 주제를 최대 5개 나열해줘. 각 핵심 주제는 서로 달라야 하고, 최소 10글자에서 최대 30글자 이내로 표현해줘.
            중요도가 높은 순서대로 나열해줘. 리스트의 번호가 뒷 번호일 수록 중요도가 낮은 주제야.

            [${title}]
            ${contents}
            ` }],
            "model": "gpt-3.5-turbo",
            functions
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return data;
    } catch (e) {
        console.log(e)
    }
}

async function getArticleSummary(title, contents) {

    const functions = [
        {
            "name": "getTopicsFromArticle",
            "description": "Summary this article up to 10 sentences.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {
                        "type": "string",
                        "description": "up to 5 key topics within 30 characters",
                    },
                },
                "required": ["summary"],
            },
        }
    ]

    try {
        const { data } = await axios.post(OPENAI_BASE_URL, {
            messages: [{
                "role": "user", "content": ` 아래 기사를 10문장으로 요약해줘.

            [${title}]
            ${contents}
            ` }],
            "model": "gpt-3.5-turbo",
            functions
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return data;
    } catch (e) {
        console.log(e)
    }
}

module.exports = { getTopicsFromArticle, getArticleSummary }