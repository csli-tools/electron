package main

import (
	"bufio"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/cosmos/cosmos-sdk/crypto"
	"github.com/cosmos/cosmos-sdk/crypto/keyring"
	cryptotypes "github.com/cosmos/cosmos-sdk/crypto/types"
)

func getKey(writer http.ResponseWriter, request *http.Request) {
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	writer.Header().Set("Content-Type", "application/json")

	// fmt.Fprintf(w, "Welcome to the HomePage!")
	// fmt.Println("Endpoint Hit: homePage")

	var ring keyring.Keyring
	var err error
	var armoredPrivateKey string

	inBuf := bufio.NewReader(os.Stdin)

	ring, err = keyring.New("wasm", "os", "/Users/samingle/.wasmd", inBuf)
	if err != nil {
		fmt.Println(err)
		return
	}

	values := request.URL.Query()
	keyName := values["key"]
	if len(keyName) < 1 {
		fmt.Println("no key provided")
		return
	}

	armoredPrivateKey, err = ring.ExportPrivKeyArmor(keyName[0], "")
	if err != nil {
		fmt.Println(err)
		return
	}
	var privateKey cryptotypes.PrivKey
	var algorithm string
	privateKey, algorithm, err = crypto.UnarmorDecryptPrivKey(armoredPrivateKey, "")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(algorithm)
	var output []byte
	base64PrivateKey := base64.StdEncoding.EncodeToString(privateKey.Bytes())
	output, err = json.Marshal(base64PrivateKey)
	fmt.Fprintf(writer, string(output))
}

func getKeys(writer http.ResponseWriter, request *http.Request) {
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	writer.Header().Set("Content-Type", "application/json")

	var kr keyring.Keyring
	var err error
	inBuf := bufio.NewReader(os.Stdin)

	kr, err = keyring.New("wasm", "os", "/Users/samingle/.wasmd", inBuf)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(kr.List())
	list, err := kr.List()
	keys := make([]map[string]interface{}, 0)
	for i := 0; i < len(list); i++ {
		key := map[string]interface{}{"key": list[i].GetName(), "address": list[i].GetAddress(), "algorithm": list[i].GetAlgo()}
		keys = append(keys, key)
	}
	var output []byte
	output, err = json.Marshal(keys)
	fmt.Fprintf(writer, string(output))
}

func main() {

	http.HandleFunc("/key", getKey)
	http.HandleFunc("/keys", getKeys)
	log.Fatal(http.ListenAndServe(":8889", nil))
}
