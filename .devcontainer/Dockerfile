FROM --platform=linux/amd64 node:lts-bookworm-slim
SHELL ["/bin/bash", "-c"]
RUN apt update && apt install -y curl bash git tar gzip libc++-dev unzip
RUN curl -fsSL https://bun.sh/install | bash
ENTRYPOINT ["bun"]
