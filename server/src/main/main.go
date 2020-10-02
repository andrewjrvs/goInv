package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

func addEndpoint(uri string, call func(string) func(http.ResponseWriter, *http.Request)) {
	http.HandleFunc(uri, call(uri))
}

func main() {
	addEndpoint("/api/inventory/", Api_inventory)
	addEndpoint("/api/product/", Api_product)
	//addEndpoint("/api/pending/", Api_pending)

	http.HandleFunc("/test/", testCall)
	http.HandleFunc("/", FileServer)
	http.ListenAndServe(":8080", nil)
	fmt.Println("Listening on 8080")
}

func testCall(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, r.Method)
	fmt.Fprintln(w, r.URL.Path)
	fmt.Fprintln(w, r.URL.Query())
}

func FileServer(w http.ResponseWriter, r *http.Request) {
	pwd, _ := os.Getwd()

	// get the last entry in a the path...
	fullPath := r.URL.Path
	lastEntry := fullPath[strings.LastIndex(fullPath, "/")+1:]
	if lastEntry == "" && strings.LastIndex(lastEntry, ".") < 0 {
		if !strings.HasSuffix(fullPath, "/") {
			fullPath += "/"
		}
		fullPath += "index.html"
	}
	fullPath = pwd + "/static" + fullPath
	if !fileExists(fullPath) {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	dat, _ := ioutil.ReadFile(fullPath)
	rtnContent := string(dat)

	if strings.HasSuffix(fullPath, ".css") {
		w.Header().Add("Content-Type", `text/css`)

	}

	fmt.Fprint(w, rtnContent)

}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
