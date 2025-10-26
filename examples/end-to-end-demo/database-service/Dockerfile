FROM denoland/deno:alpine-1.45.5

WORKDIR /app

# Copy service files
COPY deno.json .
COPY mod.ts .

# Cache dependencies
RUN deno cache mod.ts

# Run the service
CMD ["deno", "run", "--allow-net", "--allow-env", "mod.ts"]
