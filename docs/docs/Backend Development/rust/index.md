---
tags: [Backend, Rust]
---
# Writing a Backend Service in Rust

## Prerequisites

* [Rust](https://www.rust-lang.org/tools/install)
* [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)
* [NATS server](https://docs.nats.io/nats-server/installation)
* [NATS client](https://docs.rs/nats/0.8.0/nats/)
* [Tokio](https://docs.rs/tokio/1.9.0/tokio/)


## Connecting to the Message Bus

[//]: # (Connect to NATS server and subscribe to a subject using standard Rust NATS.io client)
```rust
use nats::asynk::Connection;
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
	let nc = Connection::new("nats://localhost:4222").await?;
	let sub = nc.subscribe("bar")?.with_handler(move |msg| {
		println!("Received {}", &msg);
		Ok(())
	});
	
	Ok(())
}
```

## Getting configuration from the environment

[//]: # (Get configuration from the environment using the dotenv crate)

```rust
[dependencies]
dotenv = "0.15.0"
```

[//]: # (Get configuration from the environment using the dotenv crate)
```rust
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
	dotenv().ok();
	
	let nats_url = env::var("NATS_URL")?;
	let nc = Connection::new(nats_url).await?;
	
	Ok(())
}
```
