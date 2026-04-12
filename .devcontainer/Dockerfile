FROM mcr.microsoft.com/devcontainers/typescript-node:22

RUN npm install -g tsx

WORKDIR /workspace

COPY package.json ./
RUN npm install

CMD ["sleep", "infinity"]
