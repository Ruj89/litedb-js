FROM alpine:3.21 as builder
RUN apk add dotnet9-sdk
RUN apk add git
RUN apk add nodejs
RUN apk add npm

FROM builder as development
RUN apk add mandoc man-pages
RUN apk add git-doc

RUN addgroup developer && \
    adduser -G developer -s /bin/sh -D developer && \
    mkdir -p /home/developer && chown -R developer:developer /home/developer

USER developer
WORKDIR /home/developer