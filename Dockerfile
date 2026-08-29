FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV HEADLESS=true
ENV PORT=3000

EXPOSE 8080

CMD ["./start.sh"]
