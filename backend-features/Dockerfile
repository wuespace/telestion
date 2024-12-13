FROM node:21-alpine
LABEL authors="zklaschka"

# Install gherkin-lint and feature-to-md
RUN npm install -g gherkin-lint@3.3.1

# Set the working directory
WORKDIR /features

CMD ["echo", "{}"]