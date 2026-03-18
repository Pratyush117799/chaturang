from docx import Document
import json

input_file = "chaturanga_chatbot_dataset.docx"
output_file = "dataset.jsonl"

doc = Document(input_file)

lines = [p.text.strip() for p in doc.paragraphs if p.text.strip() != ""]

pairs = []
i = 0

while i < len(lines)-1:
    if lines[i].startswith("Q:") and lines[i+1].startswith("A:"):
        question = lines[i][2:].strip()
        answer = lines[i+1][2:].strip()
        pairs.append({
            "prompt": f"User: {question}",
            "response": answer
        })
        i += 2
    else:
        i += 1

with open(output_file, "w", encoding="utf-8") as f:
    for item in pairs:
        f.write(f"{json.dumps(item, ensure_ascii=False)}\n")

print("Done! Total pairs:", len(pairs))
