import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 0. 使用一个已微调的情感模型 (有知识的模型)
model_name = "distilbert-base-uncased-finetuned-sst-2-english"



# 1. 加载 Tokenizer 和 Model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)



# 2. 准备输入 (自动分词并返回 PyTorch Tensor)
text = "The long you live, the more scars you have"
model_inputs = tokenizer(text, return_tensors="pt")



# 3. 执行模型推理 (Prediction)，切换到评估模式 (关闭 Dropout/Batch Norm)
model.eval()
with torch.no_grad(): # 关闭梯度计算，节省资源
    model_outputs = model(**model_inputs) # 将输入的字典展开并传入模型



# 4. 获取预测结果（标签顺序基于 SST-2 惯例: 0=NEGATIVE, 1=POSITIVE）
labels = ['NEGATIVE', 'POSITIVE']

# 找到 Logits (原始分数) 中最高分的索引
prediction_index = model_outputs.logits.argmax().item()




# 5. 打印最终结果
print(f"输入: '{text}'")
print(f"预测标签: {labels[prediction_index]}")