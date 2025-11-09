const input = document.getElementById('usrInput');
const resultArea = document.getElementById('result');
const historyArea = document.getElementById('list');
const localHistory = localStorage.getItem('history');
const history = localHistory ? JSON.parse(localHistory) : [];
document.getElementById('analyze').addEventListener('click', analyzeSentence);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeSentence();
});

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();


    async function callSentimentApi(sentence) {
        console.log(`正在向后端 API 发送请求，内容: "${sentence}"`);

        // --- *** 替换成您自己的 API 调用代码 *** ---
        // 示例：使用 fetch API 调用一个假想的后端路由
        /*
        const apiUrl = '/api/analyze_sentiment'; // 假设的后端地址
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: sentence })
            });
            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态: ${response.status}`);
            }
            const data = await response.json();
            return data; // 期望返回 { sentiment: "Positive", score: 0.95 }
        } catch (error) {
            console.error("API 调用失败:", error);
            // 如果 API 失败，返回一个默认或错误结构
            return { sentiment: "Error", score: 0 };
        }
        */

        // --- 模拟数据（用于演示前端逻辑） ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
        const sentiments = ["Positive", "Negative", "Neutral"];
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        return { sentiment: randomSentiment, score: Math.random().toFixed(2) };
        // --- 模拟数据结束 ---
    }

    /**
     * 处理分析请求的函数
     */
    async function analyzeSentence() {
        const sentence = input.value.trim();
        if (!sentence) return;

        // 清空前一次结果并显示加载状态
        resultArea.innerHTML = '发送请求中';
        resultArea.className = ''; // 移除所有颜色类

        try {
            const result = await callSentimentApi(sentence);

            // 更新结果显示
            displayResult(sentence, result.sentiment, result.score);

            // 更新历史记录
            addToHistory(sentence, result.sentiment);

        } catch (error) {
            resultArea.innerHTML = `<span style="color: red;">分析过程中出现错误: ${error.message}</span>`;
        } finally {
            // 清空输入框
            input.value = '';
        }
    }

    /**
     * 在页面上显示分析结果
     */
    function displayResult(sentence, sentiment, score) {
        let sentimentClass = '';
        let sentimentText = '';

        // 根据后端返回的情感标签设置样式和友好文本
        switch (sentiment.toLowerCase()) {
            case 'positive':
                sentimentClass = 'sentiment-positive';
                sentimentText = '积极';
                break;
            case 'negative':
                sentimentClass = 'sentiment-negative';
                sentimentText = '消极';
                break;
            case 'neutral':
                sentimentClass = 'sentiment-neutral';
                sentimentText = '中性';
                break;
            default:
                sentimentClass = '';
                sentimentText = sentiment; // 如果返回其他值，直接显示
        }

        resultArea.className = `result ${sentimentClass}`;
        resultArea.innerHTML = `
            <strong>您输入的句子:</strong> ${sentence} <br>
            <strong>分析结果:</strong> 
            <span class="history-sentiment" style="background-color: inherit; color: inherit; border: none;">${sentimentText}</span> 
            (置信度/分数: ${score})
        `;
    }

    // --- 历史记录管理函数 ---

    function addToHistory(sentence, sentiment) {
        const timestamp = new Date().toLocaleTimeString();
        const historyItem = {
            text: sentence,
            sentiment: sentiment,
            time: timestamp
        };

        // 1. 存入内存
        history.unshift(historyItem);
        localStorage.setItem('sentimentHistory', JSON.stringify(history));

        // 3. 重新渲染列表
        renderHistory();
    }
});

function renderHistory() {
    historyList.innerHTML = ''; // 清空列表

    if (history.length === 0) {
        historyList.innerHTML = '<li>暂无历史记录。</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');

        let sentimentBadgeClass = '';
        let sentimentText = item.sentiment;

        // 匹配颜色类
        switch (item.sentiment.toLowerCase()) {
            case 'positive':
                sentimentBadgeClass = 'sentiment-positive';
                sentimentText = '积极';
                break;
            case 'negative':
                sentimentBadgeClass = 'sentiment-negative';
                sentimentText = '消极';
                break;
            case 'neutral':
                sentimentBadgeClass = 'sentiment-neutral';
                sentimentText = '中性';
                break;
            default:
                sentimentBadgeClass = '';
                sentimentText = item.sentiment;
        }

        li.innerHTML = `
                <span class="history-text">"${item.text}"</span>
                <div>
                    <span class="history-sentiment ${sentimentBadgeClass}" 
                          style="background-color: inherit; color: inherit; border: none;">
                        ${sentimentText}
                    </span>
                    <small>(${item.time})</small>
                </div>
            `;
        historyList.appendChild(li);
    });
}