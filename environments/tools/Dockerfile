FROM node:22-alpine

WORKDIR /tool

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src

ENTRYPOINT ["node", "--import", "tsx", "./src/cli.tsx"]
