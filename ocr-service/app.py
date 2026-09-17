import io

import pytesseract
from deep_translator import GoogleTranslator
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="Hindi OCR Translation Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/translate-image")
async def translate_image(file: UploadFile = File(...)) -> dict[str, str]:
    try:
        image = Image.open(io.BytesIO(await file.read()))
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from error

    try:
        text = pytesseract.image_to_string(image, lang="hin+eng").strip()
    except pytesseract.TesseractError as error:
        raise HTTPException(
            status_code=500,
            detail="Hindi OCR is not configured. Install the Hindi Tesseract language data.",
        ) from error

    if not text:
        return {"text": "", "translation": ""}

    try:
        translation = GoogleTranslator(source="hi", target="en").translate(text)
    except Exception as error:
        raise HTTPException(status_code=502, detail="Translation service is unavailable.") from error

    return {"text": text, "translation": translation or ""}