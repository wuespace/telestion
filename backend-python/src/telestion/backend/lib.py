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
    nc: NatsClient | None   # None if Options.nats = False
    data_dir: Path
    service_name: str
    config: TelestionConfig

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
    nats: bool = True
    # (officially) we don't support int keys, btw...
    overwrite_args: dict[str, Any] | None = None
    custom_nc: NatsClient | None = None

    def without_nats(self) -> 'Options':
        return replace(self, nats=False)

    def with_overwrite_args(self, **kwargs) -> 'Options':
        return replace(self, overwrite_args=kwargs)

    def with_custom_nc(self, nats_client: NatsClient) -> 'Options':
        return replace(self, custom_nc=nats_client)


async def start_service(opts: Options = None) -> Service:
    if opts is None:
        opts = Options()

    config = build_config()
    if opts.overwrite_args is not None:
        config.update(opts.overwrite_args)

    service = Service(opts.custom_nc, config.data_dir, config.service_name, config)

    if not opts.nats or opts.custom_nc is not None:
        return service

    async def error_cb(err):
        print(err)

    nc = await nats.connect(servers=_prepare_nats_url(config), error_cb=error_cb)
    # Setup healthcheck
    async def respond(msg):
        msg.respond(
            json_encode({
                "errors": 0,
                "name": config.service_name
            })
        )

    await nc.subscribe(
        '__telestion__.health',
        cb=respond
    )

    return replace(service, nc=nc)


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
