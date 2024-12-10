FROM denoland/deno:alpine-2.1.2
LABEL version="1.0.0-alpha.4" maintainer="WüSpace e. V. <telestion@wuespace.de>"

# Add files
COPY ./mod.ts /app/mod.ts
COPY ./deno.json /app/deno.json
COPY ./samples /app/samples

# Cache dependencies in container layer
WORKDIR /app
RUN deno cache /app/samples/**/*.ts

# Run
WORKDIR /app/samples
ENTRYPOINT [ "deno", "run", "--allow-all" ]
