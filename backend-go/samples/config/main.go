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
	fmt.Printf("Service Name: %s\n", service.ServiceName)
	fmt.Printf("Data Directory: %s\n", service.DataDir)
	fmt.Printf("Config: %v\n", service.Config)

	// Check for custom config variable "ABC"
	if val, ok := service.Config["ABC"]; ok {
		fmt.Printf("ABC: %v\n", val)
	} else {
		fmt.Println("ABC not found in custom config")
	}
}
