package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OpenFoodFactBaseProduct struct {
	Categories   string `json:"categories" yaml:"categories" bson:"categories"`
	Code         string `json:"code" yaml:"code" bson:"code"`
	Product_name string `json:"product_name" yaml:"product_name" bson:"product_name"`
	Brand_owner  string `json:"brand_owner" yaml:"brand_owner" bson:"brand_owner"`
	Image_url    string `json:"image_url,omitempty" yaml:"image_url" bson:"image_url"`
	Brands       string `json:"brands,omitempty" yaml:"brands" bson:"brands"`
}

type OpenFoodFactsResponse struct {
	Status        int                     `json:"status" yaml:"status" bson:"status"`
	Product       OpenFoodFactBaseProduct `json:"product" yaml:"product" bson:"product"`
	StatusVerbose string                  `json:"status_verbose" yaml:"status_verbose" bson:"status_verbose"`
	Code          string                  `json:"code" yaml:"code" bson:"code"`
}

// Api_product manages the requests for the product restful endpoint.
func Api_product(endpoint string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, endpoint)
		switch r.Method {
		case "GET":
			findInCache(w, r, path)
		case "POST":
			updateCache(w, r, path)
		case "DELETE":
			deleteCache(w, r, path)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}
}

// deleteCache processes the 'DELETE' request, and will remove the entry from the MONGODB
func deleteCache(w http.ResponseWriter, r *http.Request, path string) {
	id := path
	if id == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	client, ctx, close, err := Connect()
	if err != nil {
		log.Fatal(err)
	}

	defer close()

	// see if we can find the 'cache' here first...
	collection := client.Database("currentLog").Collection("cache")

	result, err := collection.DeleteOne(ctx, bson.M{"code": id})
	if err != nil {
		log.Fatal(err)
	}
	if result.DeletedCount > 0 {
		w.WriteHeader(http.StatusGone)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// isValidCache checks to see if there is enough information submitted to warrent adding the content
// into our database
func isValidCache(prd OpenFoodFactBaseProduct) bool {
	if (OpenFoodFactBaseProduct{}) == prd {
		return false
	}
	if prd.Code == "" {
		return false
	}
	if prd.Product_name == "" {
		return false
	}
	return true
}

// updateCache will take the content from a POST and add it to the CACHE database
func updateCache(w http.ResponseWriter, r *http.Request, path string) {
	var cacheSubmission OpenFoodFactBaseProduct

	// Try to decode the request body into the struct. If there is an error,
	// respond to the client with the error message and a 400 status code.
	err := json.NewDecoder(r.Body).Decode(&cacheSubmission)
	if err != nil || !isValidCache(cacheSubmission) {
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

	collection := client.Database("currentLog").Collection("cache")

	opts := options.Update().SetUpsert(true)

	update := bson.M{
		"$set": cacheSubmission,
	}

	_, err = collection.UpdateOne(
		ctx,
		bson.M{"code": cacheSubmission.Code},
		update,
		opts,
	)
	if err != nil {
		log.Fatal(err)
		w.WriteHeader(http.StatusBadGateway)
	}

	w.WriteHeader(http.StatusCreated)

}

// findInCache is the default lookup, we will attempt to find the content in our mongoDB, but if it doesn't
// exist yet, we will query our external host, and add it to our cache if it is found.
func findInCache(w http.ResponseWriter, r *http.Request, path string) {
	id := path

	if id == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var rtnData OpenFoodFactBaseProduct
	client, ctx, close, err := Connect()

	if err != nil {
		log.Fatal(err)
	}

	defer close()

	// see if we can find the 'cache' here first...
	collection := client.Database("currentLog").Collection("cache")
	cur, err := collection.Find(ctx,
		bson.D{
			primitive.E{Key: "code",
				Value: id}})
	if err != nil {
		log.Fatal(err)
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		// create a value into which the single document can be decoded
		err := cur.Decode(&rtnData)
		if err != nil {
			log.Fatal(err)
		}
	}
	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}

	// if the data wasn't in the cache, lets
	// look it up...
	if (OpenFoodFactBaseProduct{}) == rtnData {
		log.Printf("Attempting openfoodfacts lookup of [%s]", id)
		uri := fmt.Sprintf("https://world.openfoodfacts.org/api/v0/product/%s.json", id)
		resp, err := http.Get(uri)
		if err != nil {
			log.Fatal(err)
		}
		defer resp.Body.Close()

		body, _ := ioutil.ReadAll(resp.Body)

		var productResp OpenFoodFactsResponse

		if err := json.Unmarshal(body, &productResp); err != nil {
			panic(err)
		}

		if productResp.Status == 1 {
			_, err := collection.InsertOne(ctx, productResp.Product)
			if err != nil {
				log.Fatal(err)
			}
			rtnData = productResp.Product
		}
	}

	if (OpenFoodFactBaseProduct{}) == rtnData {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	out, _ := json.Marshal(&rtnData)
	w.Header().Add("Content-Type", `application/json`)
	fmt.Fprint(w, string(out))
}
