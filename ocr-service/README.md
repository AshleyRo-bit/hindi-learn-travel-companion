# Hindi OCR service

This service keeps OCR outside Expo Go. It uses Tesseract locally for Hindi and
English text recognition, then translates the recognized text to English.

## Install system OCR data

On Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-hin
```

## Run the service

```bash
cd ocr-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Set the Expo app URL to the computer's LAN address when testing on a phone:

```bash
EXPO_PUBLIC_OCR_SERVICE_URL=http://192.168.1.20:8000 npx expo start
```

The phone and computer must be on the same network. The service exposes
`POST /translate-image` with a multipart `file` field and returns `text` and
`translation`.