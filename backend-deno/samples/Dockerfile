FROM denoland/deno:alpine-1.39.0
LABEL version="1.0.0-alpha.3" maintainer="WüSpace e. V. <telestion@wuespace.de>"

# Add files
COPY ./mod.ts /app/mod.ts
COPY ./samples /app/samples

# Cache dependencies in container layer
RUN deno cache /app/samples/**/*.ts

# Run
WORKDIR /app/samples
ENTRYPOINT [ "deno", "run", "--allow-all" ]
