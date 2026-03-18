import docx
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    doc = docx.Document('chaturanga.docx')
    for para in doc.paragraphs:
        if para.text.strip():
            print(para.text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
