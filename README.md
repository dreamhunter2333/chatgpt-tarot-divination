# chatgpt tarot divination

![demo](assets/demo.png)

```yaml
services:
  chatgpt-tarot-divination:
    image: ghcr.io/dreamhunter2333/chatgpt-tarot-divination:latest
    container_name: chatgpt-tarot-divination
    restart: always
    ports:
      - 8000:8000
    environment:
      - api_key=sk-xxx
      - api_base=https://api.openai.com/v1 # optional
      - model=gpt-3.5-turbo # optional
      - rate_limit=10/minute # optional
```
