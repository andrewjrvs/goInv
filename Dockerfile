FROM golang:1.15 AS gobuilder

# Set necessary environmet variables needed for our image
ENV GO111MODULE=auto \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Move to working directory /build
WORKDIR /go

# Copy the code into the container
COPY server/ .

# Build the application
# RUN go build -o main .
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o main main

#ENTRYPOINT ["main"]
#ENTRYPOINT ["bash"]

FROM node:14 AS angularbuilder

# Move to working directory /build
WORKDIR /node

# Copy the code into the container
COPY web/ .

RUN npm install
RUN npm run build

# get the certs!
FROM alpine as certs
RUN apk upgrade \
    && apk add --no-cache \
    ca-certificates \
    && update-ca-certificates 2>/dev/null || true

# # create the image.
# FROM scratch

EXPOSE 8080

COPY --from=gobuilder /go/main /app/
COPY --from=angularbuilder /node/dist/inventory/ /app/static/
## COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

WORKDIR /app

ENTRYPOINT ["./main"]
