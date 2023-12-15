FROM squidfunk/mkdocs-material:9
MAINTAINER "WüSpace e.V."

# Install mkdocs plugins from requirements.txt
COPY docs/requirements.txt /docs/requirements.txt
RUN pip install -r /docs/requirements.txt

# Copy .git to /docs/.git
COPY .git /.git

WORKDIR /docs
STOPSIGNAL SIGKILL
ENTRYPOINT ["mkdocs"]
CMD ["serve", "--dev-addr=0.0.0.0:4044"]
