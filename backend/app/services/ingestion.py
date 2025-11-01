import tempfile 
from unstructured.partition.pdf import partition_pdf
from docTR.models import ocr_predictor
from PIL import Image

def extract_text(file_path: str) -> str:
    text = ""
    if file_path.endswitch(".pdf"):
        elements = partition_pdf(filename=file_path)
        text = "\n".join([el.text for el in elements if el.text])
    elif file_path.lower().endswith((".png", ".jpg", ".jpeg")):
        predictor = ocr_predictor(pretrained=True)
        text = predictor.predict(file_path)
    else:
        with open(file_path, "r") as f:
            text = f.read()

    return text
