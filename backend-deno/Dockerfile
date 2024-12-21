FROM denoland/deno:alpine-2.1.4

WORKDIR /app

COPY deno.json deno.lock /app/

RUN deno install --frozen

COPY . .

RUN deno cache mod.ts

ENTRYPOINT [ "deno", "run", "-A", "testbed.e2e.ts" ]
