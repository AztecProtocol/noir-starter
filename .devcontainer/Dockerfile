FROM alpine:3.18.5 as noir
RUN apk add curl bash git tar gzip libc++-dev
RUN mkdir -p root/.nargo/bin
RUN curl -# -L https://github.com/noir-lang/noir/releases/latest/download/nargo-x86_64-unknown-linux-musl.tar.gz | tar -xzC root/.nargo/bin
ENV NARGO_HOME="/root/.nargo/bin"
ENV PATH="$NARGO_HOME:$PATH"
ENTRYPOINT ["nargo"]
