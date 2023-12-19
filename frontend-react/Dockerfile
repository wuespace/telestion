FROM node:21-alpine

# creates an "invisible" docker volume during container startup
# by retaining the node_modules from the image build
# to support different cpu architectures
VOLUME /app/node_modules
RUN npm install -g pnpm

COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml

WORKDIR /app
RUN pnpm install --frozen-lockfile

ENTRYPOINT ["pnpm", "run"]
CMD ["dev", "--host=0.0.0.0"]
