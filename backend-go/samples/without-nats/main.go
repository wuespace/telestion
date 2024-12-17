package main

import (
	"fmt"
	. "github.com/wuespace/telestion/backend-go"
)

func main() {
	service, err := StartService(WithoutNats())
	if err != nil {
		panic(err)
	}
	fmt.Println(service.Config)
	service.Drain()
}
