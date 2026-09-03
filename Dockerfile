FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 콘솔은 vite preview 로 서빙하지만, 랜딩은 공개 정적 페이지라
# Agent-Dashboard 와 같은 nginx 패턴을 쓴다.
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
