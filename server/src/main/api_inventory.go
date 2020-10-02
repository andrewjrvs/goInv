package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InventoryBase struct {
	Id string `json:"_id,omitempty" yaml:"_id" bson:"_id,omitempty"`

	Product_name string `json:"product_name" yaml:"product_name" bson:"product_name"`
	Image_url    string `json:"image_url,omitempty" yaml:"image_url,omitempty" bson:"image_url,omitempty"`
	Brand_owner  string `json:"brand_owner" yaml:"brand_owner" bson:"brand_owner"`
	Quantity     *int   `json:"quantity,omitempty" yaml:"quantity,omitempty" bson:"quantity,omitempty"`
	Code         string `json:"code,omitempty" yaml:"code,omitempty" bson:"code,omitempty"`
	Key          string `json:"__key,omitempty" yaml:"__key,omitempty" bson:"__key,omitempty"`
	Created      string `json:"created,omitempty" yaml:"created,omitempty" bson:"created,omitempty"`
	Expire       string `json:"expire,omitempty" yaml:"expire,omitempty" bson:"expire,omitempty"`
	SessionKey   string `json:"session_key,omitempty" yaml:"session_key,omitempty" bson:"session_key,omitempty"`
	Removed      bool   `json:"removed,omitempty" yaml:"removed,omitempty" bson:"removed,omitempty"`
	Pending      bool   `json:"pending,omitempty" yaml:"pending,omitempty" bson:"pending,omitempty"`
	// type inheritance is kinda weird in GO...
	//OpenFoodFactBaseProduct
}

// Api_product manages the requests for the product restful endpoint.
func Api_inventory(endpoint string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, endpoint)
		switch r.Method {
		case "GET":
			getCurrentList(w, r, path)
		case "DELETE":

			if _, ok := r.URL.Query()["purge"]; ok {
				deleteItem(w, r, path)
			} else {
				markItemRemoved(w, r, path)
			}
		case "PUT":
			putItem(w, r, path)
		case "POST":
			if path != "" {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}
			insertItem(w, r, path)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}
}

// getCurrentList returns the list of items...
func getCurrentList(w http.ResponseWriter, r *http.Request, path string) {
	// Set client options
	var arr []interface{}

	client, ctx, close, err := Connect()

	if err != nil {
		fmt.Println(`Error with connect`)
		log.Fatal(err)
	}
	defer close()

	query := bson.D{
		primitive.E{Key: "$or", Value: bson.A{
			bson.D{primitive.E{Key: "removed", Value: bson.M{"$exists": false}}},
			bson.D{primitive.E{Key: "removed", Value: false}},
		}},
	}

	if path != "" {
		query = append(query, primitive.E{Key: "_id", Value: path})
	} else {

		if _, ok := r.URL.Query()["pending"]; ok {
			query = append(query, primitive.E{Key: "pending", Value: true})
		} else {

			query = append(query, primitive.E{Key: "$or", Value: bson.A{
				bson.D{primitive.E{Key: "pending", Value: bson.M{"$exists": false}}},
				bson.D{primitive.E{Key: "pending", Value: false}},
			}})
		}
	}

	collection := client.Database("currentLog").Collection("f_log")
	cur, err := collection.Find(ctx, query)
	if err != nil {
		log.Fatal(err)
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {

		// create a value into which the single document can be decoded
		var elem InventoryBase
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

func deleteItem(w http.ResponseWriter, r *http.Request, path string) {
	if path == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	client, ctx, close, err := Connect()
	if err != nil {
		log.Fatal(err)
	}

	defer close()

	// see if we can find the 'cache' here first...
	collection := client.Database("currentLog").Collection("f_log")

	result, err := collection.DeleteOne(ctx, bson.M{"_id": path})
	if err != nil {
		log.Fatal(err)
	}
	if result.DeletedCount > 0 {
		w.WriteHeader(http.StatusGone)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// deleteItem this will update a single item...
func markItemRemoved(w http.ResponseWriter, r *http.Request, path string) {
	if path == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	client, ctx, close, err := Connect()
	if err != nil {
		log.Fatal(err)
	}

	defer close()

	// see if we can find the 'cache' here first...
	collection := client.Database("currentLog").Collection("f_log")

	filter := bson.D{
		primitive.E{Key: "_id", Value: path},
		primitive.E{Key: "$or", Value: bson.A{
			bson.D{primitive.E{Key: "removed", Value: bson.M{"$exists": false}}},
			bson.D{primitive.E{Key: "removed", Value: false}},
		}},
	}

	update := bson.M{
		"$set": bson.M{"removed": true},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Fatal(err)
	}
	if result.ModifiedCount > 0 {
		// then lets try it
		w.WriteHeader(http.StatusGone)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func putItem(w http.ResponseWriter, r *http.Request, path string) {
	if path == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var updateSubmission InventoryBase

	err := json.NewDecoder(r.Body).Decode(&updateSubmission)
	if err != nil {
		//http.Error(w, err.Error(), http.StatusBadRequest)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	client, ctx, close, err := Connect()

	if err != nil {
		fmt.Println(`Error with connect`)
		log.Fatal(err)
	}
	defer close()

	collection := client.Database("currentLog").Collection("f_log")

	filter := []bson.M{bson.M{"_id": path},
		bson.M{"removed": false},
	}

	update := bson.M{
		"$set": updateSubmission,
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Fatal(err)
	}
	if result.ModifiedCount < 1 {
		// then lets try it
		w.WriteHeader(http.StatusExpectationFailed)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func insertItem(w http.ResponseWriter, r *http.Request, path string) {

	var updateSubmission InventoryBase

	err := json.NewDecoder(r.Body).Decode(&updateSubmission)
	if err != nil || (InventoryBase{}) == updateSubmission {
		http.Error(w, err.Error(), http.StatusBadRequest)
		//w.WriteHeader(http.StatusTeapot)
		return
	}

	client, ctx, close, err := Connect()

	if err != nil {
		log.Fatal(err)
	}
	defer close()

	collection := client.Database("currentLog").Collection("f_log")

	cleanupSubmission(&updateSubmission)
	fmt.Println(updateSubmission)
	insertResult, err := collection.InsertOne(ctx, updateSubmission)
	if err != nil {
		log.Fatal(err)
		w.WriteHeader(http.StatusExpectationFailed)
		return
	}

	fmt.Println(insertResult.InsertedID)
	if str, ok := insertResult.InsertedID.(string); ok {
		updateSubmission.Id = str
		out, _ := json.Marshal(&updateSubmission)
		w.Header().Add("Content-Type", `application/json`)
		fmt.Fprint(w, string(out))
	} else {
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func cleanupSubmission(req *InventoryBase) {
	// // not sure about what I'm doing wrong that I need to add this... :|
	if req.Id == "" {
		id, _ := uuid.NewRandom()
		req.Id = id.String()
	}
	if req.Quantity == nil {
		defaultInt := 1
		req.Quantity = &defaultInt
	}

	if req.Created == "" {
		req.Created = time.Now().UTC().Format("2006-01-02")
	}
	if req.Expire == "" {
		req.Expire = time.Now().UTC().AddDate(0, 3, 0).Format("2006-01-02")
	}
}
