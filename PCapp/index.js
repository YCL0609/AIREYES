const input = document.getElementById('usrInput');
const resultArea = document.getElementById('result');
const historyArea = document.getElementById('list');
const localHistory = localStorage.getItem('history');
const txtHistory = localHistory ? JSON.parse(localHistory) : [];
const apiUrl = 'http://localhost:5000/analyze_sentiment';

// 开始分析相关
document.getElementById('analyze').addEventListener('click', analyze);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') analyze() });

// 历史记录相关
document.addEventListener('DOMContentLoaded', () => txtHistory.forEach(item => showHistory(item)));
document.getElementById('clear').addEventListener('click', () => {
    localStorage.clear();
    txtHistory.length = 0;
    historyArea.innerHTML = '';
});

async function analyze() {
    const sentence = input.value.trim();
    if (!sentence) return;

    // 显示加载状态
    resultArea.className = 'result';
    resultArea.innerHTML = 'Loading...';

    try {
        // 发送请求到后端 API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: sentence,
                token: "AIREYES-mRgHmEcPoAKFEtO7jUmdMxgt9LSR4CeA"
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status + ' ' + response.statusText}`);
        const data = await response.json();
        if (data.error) throw new Error(data.predicted_label);

        // 更新结果显示
        const inputText = document.createElement('strong');
        const scoreText = document.createElement('strong');
        const resultText = document.createElement('strong');
        const br = document.createElement('br');

        inputText.style.wordBreak = 'break-word';
        inputText.innerText = `Input: ${sentence}`;
        scoreText.innerText = `Score: ${(data.probabilities.POSITIVE * 100).toFixed(2)}%`;

        // 根据情感完成样式设置
        switch (data.predicted_label) {
            case 'POSITIVE':
                resultArea.className = 'result positive';
                resultText.innerText = 'Result: Positive';
                break;
            case 'NEGATIVE':
                resultArea.className = 'result negative';
                resultText.innerText = 'Result: Negative';
                break;
            default:
                resultArea.className = 'result';
                resultText.innerText = `Result: ${data.predicted_label}`;
                break;
        }

        resultArea.innerHTML = '';
        resultArea.appendChild(inputText);
        resultArea.appendChild(br.cloneNode());
        resultArea.appendChild(scoreText);
        resultArea.appendChild(br.cloneNode());
        resultArea.appendChild(resultText);

        // 更新历史记录
        const historyItem = {
            text: sentence,
            sentiment: data.predicted_label,
            time: new Date().toLocaleTimeString()
        };

        txtHistory.unshift(historyItem);
        localStorage.setItem('history', JSON.stringify(txtHistory));

        showHistory(historyItem);

    } catch (error) {
        resultArea.innerHTML = `<span style="color: red;">An error occurred during the analysis process: ${error.stack}</span>`;
    }
}

function showHistory(item) {
    const li = document.createElement('li');
    const textSpan = document.createElement('span');
    const sentimentSpan = document.createElement('span');
    const timeSmall = document.createElement('small');

    // 设置内容和样式
    textSpan.className = 'history-text';
    textSpan.innerText = item.text;
    sentimentSpan.className = 'sentiment';
    sentimentSpan.innerText = item.sentiment;
    timeSmall.innerText = `(${item.time})`;

    // 根据情感设置不同的样式
    switch (item.sentiment) {
        case 'POSITIVE':
            li.style.borderBlockEndColor = '#c3e6cb'
            sentimentSpan.classList += ' positive';
            break;
        case 'NEGATIVE':
            sentimentSpan.classList += ' negative';
            break;
        default: break;
    }

    li.appendChild(textSpan);
    li.appendChild(sentimentSpan);
    li.appendChild(timeSmall);
    historyArea.appendChild(li);
}