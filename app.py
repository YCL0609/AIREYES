import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import FastAPI
from pydantic import BaseModel

# --- 0. 模型配置 ---
# 使用一个已微调的情感模型
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
LABELS = ['NEGATIVE', 'POSITIVE']

# --- 1. 全局加载 Tokenizer 和 Model ---
# 在应用启动时加载模型和 tokenizer，避免每次请求都重新加载
print(f"Loading model: {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval()  # 切换到评估模式
print("Model loaded successfully.")

# --- 2. 定义 FastAPI 应用 ---
app = FastAPI(
    title="Sentiment Analysis API",
    description="An API service for text sentiment analysis using DistilBERT.",
    version="1.0.0"
)

# --- 3. 定义输入数据结构 ---
# 使用 Pydantic 定义请求体的结构，FastAPI 会自动进行数据校验和文档生成
class SentimentInput(BaseModel):
    text: str
    
# --- 4. 模型推理逻辑 (核心函数) ---
def predict_sentiment(text: str):
    """执行情感分析模型的推理"""
    # 准备输入 (自动分词并返回 PyTorch Tensor)
    model_inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    
    with torch.no_grad(): # 关闭梯度计算，节省资源
        # 执行模型推理
        model_outputs = model(**model_inputs)
        
    # 获取预测结果
    # 找到 Logits (原始分数) 中最高分的索引
    logits = model_outputs.logits[0]
    probabilities = torch.softmax(logits, dim=0).tolist() # 转换为概率
    prediction_index = logits.argmax().item()
    
    return {
        "text": text,
        "prediction": LABELS[prediction_index],
        "score": probabilities[prediction_index],
        "probabilities": {LABELS[i]: prob for i, prob in enumerate(probabilities)}
    }

# --- 5. 定义 API 接口路由 ---
@app.post("/predict")
async def predict(data: SentimentInput):
    """
    接收文本输入并返回情感分析结果。
    """
    try:
        # 调用推理函数
        result = predict_sentiment(data.text)
        return result
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

# 额外的健康检查路由
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Sentiment Analysis API"}