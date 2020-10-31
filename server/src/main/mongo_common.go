package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect() (mongo.Client, context.Context, func(), error) {

	uri := os.Getenv("MONGO_CONN")

	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	// Connect to MongoDB

	client, err := mongo.Connect(ctx, clientOptions)

	if err != nil {
		defer cancel()
		return mongo.Client{}, nil, nil, err
	}

	ping_err := client.Ping(ctx, nil)

	if ping_err != nil {
		log.Fatal(ping_err)
	}

	return *client, ctx, func() {
		client.Disconnect(ctx)
		cancel()
	}, err

}
