import zipfile
import re
path = r'Prompts for updation.docx'
with zipfile.ZipFile(path, 'r') as z:
    xml = z.read('word/document.xml').decode('utf-8')
text = re.sub(r'<[^>]+>', ' ', xml)
text = re.sub(r'&amp;', '&', text)
text = re.sub(r'&lt;', '<', text)
text = re.sub(r'&gt;', '>', text)
text = re.sub(r'\s+', ' ', text).strip()
with open('doc_extract.txt', 'w', encoding='utf-8') as f:
    f.write(text)
