FROM denoland/deno:alpine-2.1.4

WORKDIR /app

COPY . .
RUN deno install

ENTRYPOINT [ "deno", "run", "-A", "deno-testbed.ts" ]