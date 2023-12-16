FROM node:21-alpine

VOLUME /app
RUN npm install -g pnpm

COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml

WORKDIR /app
RUN pnpm install --frozen-lockfile

ENTRYPOINT ["pnpm", "run"]
CMD ["dev", "--host=0.0.0.0"]
