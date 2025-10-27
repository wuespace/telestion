FROM denoland/deno:alpine-2.1.2
LABEL maintainer="WüSpace e. V. <telestion@wuespace.de>"
LABEL org.opencontainers.image.source="https://github.com/wuespace/telestion"
LABEL org.opencontainers.image.description="Telestion Database Query Service - Queries time series data from InfluxDB via NATS"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy the Telestion library
COPY ./mod.ts /app/mod.ts
COPY ./deno.json /app/deno.json

# Copy the database-query service
COPY ./samples/database-query /app/service

# Cache dependencies
RUN deno cache /app/service/mod.ts

# Run the service
WORKDIR /app/service
ENTRYPOINT ["deno", "run", "--allow-all", "mod.ts"]
