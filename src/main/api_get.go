package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func getClient() {

}

func Api_CurrentList(w http.ResponseWriter, r *http.Request) {
	// Set client options
	var arr []interface{}

	uri := fmt.Sprintf("mongodb+srv://%s:%s@2%s?retryWrites=true&w=majority",
		os.Getenv("MONGO_USER"),
		os.Getenv("MONGO_PASS"),
		os.Getenv("MONGO_CONN"))
	fmt.Println(uri)
	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)
	collection := client.Database("currentLog").Collection("f_log")
	cur, err := collection.Find(ctx, bson.D{{"removed", bson.D{{"$exists", false}}}})
	if err != nil {
		log.Fatal(err)
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {

		// create a value into which the single document can be decoded
		var elem interface{}
		err := cur.Decode(&elem)
		if err != nil {
			log.Fatal(err)
		}

		arr = append(arr, &elem)
	}
	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}

	out, _ := json.Marshal(&arr)
	w.Header().Add("Content-Type", `application/json`)
	fmt.Fprint(w, string(out))
}
