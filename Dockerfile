FROM alpine:3.21 as builder
RUN apk add dotnet9-sdk
RUN apk add git
RUN apk add nodejs
RUN apk add npm

FROM builder as development
RUN apk add mandoc man-pages
RUN apk add git-doc