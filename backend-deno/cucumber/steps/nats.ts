import type { ConnectionOptions, NatsConnection } from "@nats-io/nats-core";
import { Given, Then } from "../step-registry.ts";
import { assert, assertEquals } from "@std/assert";

/**
 * A mock NATS client that can be used to test services that use NATS.
 */
export class NatsMock {
  /**
   * A list of subscriptions that have been made.
   */
  subscriptions: unknown[][] = [];
  /**
   * Whether the client is connected to NATS.
   */
  public isConnected = false;
  /**
   * Whether the client should fail to connect to NATS.
   */
  public isOffline = false;
  /**
   * Whether the server requires authentication.
   */
  public requiresAuth = false;
  /**
   * A map of usernames to passwords.
   */
  public users = new Map<string, string>();

  /**
   * Create a new mock NATS client.
   * @param server The server that the client can connect to.
   */
  constructor(public server = "localhost:4222") {
  }

  /**
   * Register a user with a password. This user can then be used to connect to NATS when `requiresAuth` is true.
   * @param username valid username
   * @param password valid password for the username
   *
   * @see {@link requiresAuth}
   */
  public registerUser(username: string, password: string) {
    this.users.set(username, password);
  }

  /**
   * A mock NATS connection that can be used to test services that use NATS.
   *
   * Gets returned by {@link connect} upon successful connection.
   *
   * Can be used to assert that the service received the correct NATS connection object.
   */
  public readonly connection = {
    subscribe: (...args: unknown[]) => {
      this.subscriptions.push(args);
    },
  };

  connect(options: ConnectionOptions) {
    if (this.server !== options.servers) {
      return Promise.reject(new Error("Invalid server"));
    }

    if (this.isOffline) {
      return Promise.reject(new Error("NATS is offline"));
    }

    if (this.requiresAuth && (!options.user || !options.pass)) {
      return Promise.reject(new Error("NATS requires authentication"));
    }

    if (this.requiresAuth && this.users.get(options.user!) !== options.pass) {
      return Promise.reject(new Error("Invalid credentials"));
    }

    this.isConnected = true;

    return Promise.resolve(this.connection);
  }
}

Given(
  "I have a NATS server running on {string}",
  (ctx, url) => {
    ctx.nats = new NatsMock(url);
  },
);

Given(
  "{string} is a NATS user with password {string}",
  (ctx, username, password) => {
    if (!ctx.nats) {
      throw new Error("No NATS mock available");
    }

    const nats = ctx.nats as NatsMock;
    nats.registerUser(username, password);
  },
);

Given("the NATS server requires authentication", (ctx) => {
  if (!ctx.nats) {
    throw new Error("No NATS mock available");
  }

  const nats = ctx.nats as NatsMock;
  nats.requiresAuth = true;
});

Given("the NATS server is offline", (ctx) => {
  if (!ctx.nats) {
    throw new Error("No NATS mock available");
  }

  const nats = ctx.nats as NatsMock;
  nats.isOffline = true;
});

Then("the service should connect to NATS", (ctx) => {
  const nats = ctx.nats as NatsMock;
  assert(nats);
  assert(nats.isConnected);
});

Then("the service should not connect to NATS", (ctx) => {
  const nats = ctx.nats as NatsMock;
  assert(nats);
  assert(!nats.isConnected);
});

Then("the NATS connection API should be available to the service", (ctx) => {
  const nats = ctx.nats as NatsMock;
  assert(nats);
  const service = ctx.service as { nc: unknown };
  assert(service);
  assert(service.nc);
  assertEquals(service.nc, nats.connection as NatsConnection);
});
