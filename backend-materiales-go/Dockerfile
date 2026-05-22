FROM golang:1.20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /src

# Copy go mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .
WORKDIR /src/cmd/api

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags "-s -w" -o /src/backend-materiales-go

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /src
# Copy binary from builder
COPY --from=builder /src/backend-materiales-go /src/backend-materiales-go
ENV PORT=5003
EXPOSE 5003
ENTRYPOINT ["/src/backend-materiales-go"]
