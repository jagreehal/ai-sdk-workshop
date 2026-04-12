#!/bin/bash
# Pull required Ollama models (idempotent - skips if already present)

OLLAMA_URL="${OLLAMA_BASE_URL:-http://ollama:11434}"

echo "Waiting for Ollama to be ready at $OLLAMA_URL..."
until curl -sf "$OLLAMA_URL/api/tags" > /dev/null 2>&1; do
  sleep 2
done
echo "Ollama is ready!"

echo ""
echo "Pulling granite4:latest (chat model)..."
curl -sf "$OLLAMA_URL/api/pull" -d '{"name": "granite4:latest"}' | while read -r line; do
  status=$(echo "$line" | grep -o '"status":"[^"]*"' | head -1)
  if [ -n "$status" ]; then
    echo "  $status"
  fi
done

echo ""
echo "Pulling embeddinggemma:latest (embedding model)..."
curl -sf "$OLLAMA_URL/api/pull" -d '{"name": "embeddinggemma:latest"}' | while read -r line; do
  status=$(echo "$line" | grep -o '"status":"[^"]*"' | head -1)
  if [ -n "$status" ]; then
    echo "  $status"
  fi
done

echo ""
echo "All models ready!"
