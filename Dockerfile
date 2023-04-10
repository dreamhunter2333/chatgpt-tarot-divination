FROM python:3.11-alpine

COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
COPY . /app
WORKDIR /app
EXPOSE 8000
ENTRYPOINT [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
