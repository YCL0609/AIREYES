import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask import Flask, request, jsonify

# 使用一个已微调的情感模型
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval() # 切换到评估模式
labels = ['NEGATIVE', 'POSITIVE']
tokens = ['AIREYES-mRgHmEcPoAKFEtO7jUmdMxgt9LSR4CeA']

# --- 2. 初始化 Flask 应用 ---
app = Flask(__name__)

# --- 3. 定义情感分析函数 ---
def analyze_sentiment(text: str):
    """
    对输入的文本进行情感分析。
    """
    # 准备输入
    model_inputs = tokenizer(text, return_tensors="pt")

    # 执行模型推理 (关闭梯度计算)
    with torch.no_grad():
        model_outputs = model(**model_inputs)

    # 获取预测结果
    # 找到 Logits (原始分数) 中最高分的索引
    prediction_index = model_outputs.logits.argmax().item()
    predicted_label = labels[prediction_index]
    
    # 获取原始分数 (Logits)
    # 使用 softmax 将 logits 转换为概率
    probabilities = torch.softmax(model_outputs.logits, dim=1).squeeze().tolist()
    
    # 构建结果字典
    result = {
        "input_text": text,
        "predicted_label": predicted_label,
        "label_index": prediction_index,
        "probabilities": {
            "NEGATIVE": probabilities[0],
            "POSITIVE": probabilities[1]
        }
    }
    
    return result

# API 路由
@app.route('/analyze_sentiment', methods=['POST'])
def handle_sentiment_request():
    # 确保请求体是 JSON 格式
    if not request.json:
        return jsonify({"error":True,"predicted_label": "Missing JSON in request"}), 400
    
    text = request.json.get('text')
    token = request.json.get('token')

    # 令牌验证
    if token not in tokens:
        return jsonify({"error":True,"predicted_label": "Invalid token"}), 403
    
    # 检查文本是否存在
    if not text:
        return jsonify({"error":True,"predicted_label": "Missing or empty 'text' field in JSON"}), 400
    
    # 执行情感分析
    analysis_result = analyze_sentiment(text)
    return jsonify(analysis_result)

# --- 5. 运行应用 ---
if __name__ == '__main__':
    # host='0.0.0.0' 使应用可以在外部访问 (如果需要)
    app.run(host='0.0.0.0', port=5000, debug=False)