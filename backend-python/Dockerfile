# Use the official python image as the base image
FROM python:3.12-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements and the rest
COPY . .
RUN pip install -r requirements.txt

# Set the entrypoint to the built binary
ENTRYPOINT ["python3", "./testbed.py"]
