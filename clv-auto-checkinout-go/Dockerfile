# Dockerfile for Go version of clv-auto-checkinout
FROM golang:1.21-alpine as builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o clv-auto-checkinout

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/clv-auto-checkinout .
COPY .env.example .env
CMD ["./clv-auto-checkinout"]
