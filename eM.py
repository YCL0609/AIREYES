import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 【关键修改：使用已微调的情感模型】
# 选用一个在 IMDB 或 SST-2 等情感数据集上训练过的模型
# 注意：uncased 是指不区分大小写，但它是在情感任务上训练过的。
# model_name = "distilbert-base-uncased"  # wrong（没有微调）
model_name = "distilbert-base-uncased-finetuned-sst-2-english"


tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# 准备输入
text = "I am angry"
model_inputs = tokenizer(text, return_tensors="pt")

model.eval()

with torch.no_grad():
    model_outputs = model(**model_inputs)

# 定义标签 (SST-2 通常是 0=NEGATIVE, 1=POSITIVE)
# 请注意，不同模型的标签顺序可能不同，这里我们根据 SST-2 惯例来定义
labels = ['NEGATIVE', 'POSITIVE']
prediction_index = model_outputs.logits.argmax().item()
softmax_scores = torch.softmax(model_outputs.logits, dim=1).tolist()[0] # 计算概率

print("--- 已微调模型预测结果 ---")
print(f"输入文本: {text}")
print(f"原始 Logits (NEGATIVE/POSITIVE): {model_outputs.logits.tolist()}")
print(f"Softmax 概率: {softmax_scores}")
print(f"模型预测标签: {labels[prediction_index]}")