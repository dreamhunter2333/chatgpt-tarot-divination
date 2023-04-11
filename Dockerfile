FROM python:3.11-alpine

COPY requirements.txt requirements.txt
RUN apk add --no-cache gcc g++ \
    && python -m pip install --no-cache-dir -r requirements.txt \
    && rm -rf /tmp/* /root/.cache /var/cache/apk/*
COPY . /app
WORKDIR /app
EXPOSE 8000
ENTRYPOINT [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
