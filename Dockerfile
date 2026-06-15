# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# RUN npm run build # Comentado pois ainda não temos scripts de build reais

# Stage 2: Final Image
FROM node:20-alpine
WORKDIR /app
# Pega apenas o necessário do stage anterior
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./

EXPOSE 3000
# Roda como usuário não-root (boa prática de segurança — finding do SAST/semgrep).
USER node
CMD ["node", "src/core/index.js"] # Exemplo de ponto de entrada
