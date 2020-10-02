FROM golang:latest AS builder

# Set necessary environmet variables needed for our image
ENV GO111MODULE=auto \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64\
    GOBIN=/go/bin

RUN go get go.mongodb.org/mongo-driver

# Move to working directory /build
WORKDIR /build

# Copy the code into the container
COPY . .

# Build the application
# RUN go build -o main .
# RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o main


EXPOSE 8080

# # Command to run when starting the container
# ENTRYPOINT ["/build/main"]
ENTRYPOINT ["bin/sh"]