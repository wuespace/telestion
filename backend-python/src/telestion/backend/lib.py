import json
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

import nats
from nats.aio.client import Client as NatsClient, Msg as NatsMsg, DEFAULT_FLUSH_TIMEOUT  # mostly for type hinting
from nats.aio.subscription import Subscription

from telestion.backend.config import TelestionConfig, build_config


@dataclass
class Service:
    """Helper Class for starting NATS clients also exposing the parsed config."""
    nc: NatsClient | None   # None if Options.nats = False
    """Configured and started NATS client for this service."""
    data_dir: Path
    """Directory where all data (temporary and persistent) should be stored."""
    service_name: str
    """Name of this service. Note that it is not necessarily unique!"""
    config: TelestionConfig
    """TelestionConfig instance for this service """

    # wrapper methods for NatsClient instance for convenience
    async def publish(self, **kwargs) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.publish"""
        await self.nc.publish(**kwargs)

    async def subscribe(self, **kwargs) -> Subscription:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.subscribe"""
        return await self.nc.subscribe(**kwargs)

    async def request(self, **kwargs) -> NatsMsg:
        """Wrapper for Client.request(subject, payload, timeout, old_style, headers)"""
        return await self.nc.request(**kwargs)

    async def flush(self, timeout: int = DEFAULT_FLUSH_TIMEOUT) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.flush"""
        await self.nc.flush(timeout)

    async def drain(self) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.drain"""
        await self.nc.drain()

    async def close(self) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.close"""
        await self.nc.close()


@dataclass
class Options:
    """Storing a custom configuration which overwrites the parsed config during startup of the Telestion service."""
    nats: bool = True
    """Whether a service should use nats. If set to False no nats client is set up during startup"""
    # (officially) we don't support int keys, btw...
    overwrite_args: dict[str, Any] | None = None
    """Arguments overwriting the parsed config of a service."""
    custom_nc: NatsClient | None = None
    """Custom nats client. During startup no configuration takes place if present."""

    def without_nats(self) -> 'Options':
        """Returns a copy of this Options instance with nats switched off."""
        return replace(self, nats=False, custom_nc=None)

    def with_overwrite_args(self, **kwargs) -> 'Options':
        """Returns a copy of this Options instance with different custom arguments."""
        return replace(self, overwrite_args=kwargs)

    def with_custom_nc(self, nats_client: NatsClient) -> 'Options':
        """Returns a copy of this Options instance with a custom client."""
        return replace(self, custom_nc=nats_client)


async def setup_healthcheck(nc: NatsClient, service_name: str) -> NatsClient:
    """Sets up __telestion__.health for a NatsClient. Returns NatsClient for fluent API."""
    async def _respond_hc(msg):
        msg.respond(
            json_encode({
                "errors": 0,
                "name": service_name
            })
        )

    await nc.subscribe(
        '__telestion__.health',
        cb=_respond_hc
    )

    return nc


async def start_service(opts: Options = None) -> Service:
    """Creates a Service for the given Options and the parsed config and spins up a new NATS client if configured so."""
    if opts is None:
        opts = Options()

    config = build_config()
    if opts.overwrite_args is not None:
        config = config.model_copy(update=opts.overwrite_args)

    service = Service(opts.custom_nc, config.data_dir, config.service_name, config)

    if not opts.nats or opts.custom_nc is not None:
        return service

    nc = await nats.connect(servers=_prepare_nats_url(config))

    return replace(service, nc=await setup_healthcheck(nc, config.service_name))


# Macros
def json_encode(msg: Any, encoding='utf-8', **dumps_kwargs) -> bytes:
    """
    Helper function to encode messages to json.
    This convenience macro helps to reduce encoding/decoding boilerplate.
    For finer control implement this function by your own and customize to your needs.

    :param msg:             message to encode
    :param encoding:        encoding to use (default: utf-8)
    :param dumps_kwargs:    additional arguments to pass to json.dumps
    :return: encoded json message as utf-8 bytes
    """
    return json.dumps(msg, **dumps_kwargs).encode(encoding=encoding)


def json_decode(msg: str | bytes | bytearray, encoding='utf-8', **loads_kwargs) -> Any:
    """
    Helper function to decode messages from json into an object.
    This convenience macro helps to reduce encoding/decoding boilerplate.
    For finer control implement this function by your own and customize to your needs.

    :param msg:             message to decode
    :param encoding:        encoding used to encode the bytes
    :param loads_kwargs:
    :return:
    """
    if not isinstance(msg, str):
        # ensure to support any encoding supported by python
        msg = msg.decode(encoding=encoding)

    return json.loads(msg, **loads_kwargs)


def _prepare_nats_url(config: TelestionConfig) -> str:
    """
    Helper function that creates the valid url for the NATS client.
    Because the Python interface does not support user authentication out of the box with a separate design this is done
    via the connecting url.

    :param config: parsed config from all sources
    :return: created url from parsed config url, user and password
    """
    url = config.nats_url

    if config.nats_user is None or config.nats_password is None:
        return url

    if '://' in url:
        _, url = url.split('://', 1)

    return f"nats://{config.username}:{config.password}@{url}"
