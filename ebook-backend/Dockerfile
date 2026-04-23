FROM node:22-slim

RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-noto-cjk \
    && fc-cache -f -v \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["npm", "start"]
