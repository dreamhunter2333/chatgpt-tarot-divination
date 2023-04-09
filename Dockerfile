FROM python:3.11-alpine

COPY /backend /app
WORKDIR /app
RUN python -m pip install -r requirements.txt
COPY /frontend/dist /app/dist
EXPOSE 8000
ENTRYPOINT [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
