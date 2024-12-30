FROM alpine:3.21 as builder
RUN apk add dotnet9-sdk
RUN apk add git
RUN apk add nodejs
RUN apk add npm
RUN apk add python3
RUN apk add make
RUN apk add g++

FROM builder as development
RUN apk add mandoc man-pages
RUN apk add git-doc
RUN apk add sudo

RUN addgroup developer && \
    adduser -G developer -s /bin/sh -D developer && \
    mkdir -p /home/developer && chown -R developer:developer /home/developer

RUN echo "developer ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer

USER developer
WORKDIR /home/developer