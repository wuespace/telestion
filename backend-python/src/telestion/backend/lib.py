import json
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

import nats
from nats.aio.client import Client as NatsClient, Msg as NatsMsg, DEFAULT_FLUSH_TIMEOUT  # mostly for type hinting
from nats.aio.subscription import Subscription

from telestion.backend.config import TelestionConfig, build_config, _TelestionConfigT


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
    async def publish(self, *args, **kwargs) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.publish"""
        await self.nc.publish(*args, **kwargs)

    async def subscribe(self, *args, **kwargs) -> Subscription:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.subscribe"""
        return await self.nc.subscribe(*args, **kwargs)

    async def request(self, *args, **kwargs) -> NatsMsg:
        """Wrapper for Client.request(subject, payload, timeout, old_style, headers)"""
        return await self.nc.request(*args, **kwargs)

    async def flush(self, timeout: int = DEFAULT_FLUSH_TIMEOUT) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.flush"""
        await self.nc.flush(timeout)

    async def drain(self) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.drain"""
        await self.nc.drain()

    async def close(self) -> None:
        """Wrapper for https://nats-io.github.io/nats.py/modules.html#nats.aio.client.Client.close"""
        await self.nc.close()


async def start_service(nats_disabled: bool = False, config: _TelestionConfigT = None) -> Service:
    """Creates a Service with the parsed config and spins up a new NATS client if configured to do so."""
    if config is None:
        config = build_config()

    nc = None if nats_disabled else await nats.connect(servers=_prepare_nats_url(config))
    return Service(nc, config.data_dir, config.service_name, config)


# Macros
def json_encode(msg: Any, encoding='utf-8', errors='strict', **dumps_kwargs) -> bytes:
    """
    Helper function to encode messages to json.
    This convenience macro helps to reduce encoding/decoding boilerplate.
    For finer control implement this function by your own and customize to your needs.

    :param msg:             message to encode
    :param encoding:        encoding to use (default: utf-8)
    :param errors:          way to handle encoding errors, see #bytes.encode()
    :param dumps_kwargs:    additional arguments to pass to json.dumps
    :return: encoded json message as utf-8 bytes
    """
    return json.dumps(msg, **dumps_kwargs).encode(encoding=encoding, errors=errors)


def json_decode(msg: str | bytes | bytearray, encoding='utf-8', errors='strict', **loads_kwargs) -> Any:
    """
    Helper function to decode messages from json into an object.
    This convenience macro helps to reduce encoding/decoding boilerplate.
    For finer control implement this function by your own and customize to your needs.

    :param msg:             message to decode
    :param encoding:        encoding used to encode the bytes
    :param errors:          way to handle encoding errors, see #bytes.decode()
    :param loads_kwargs:    additional arguments for json.loads()
    :return: if successful, returns the parsed json message
    """
    if not isinstance(msg, str):
        # ensure to support any encoding supported by python
        msg = msg.decode(encoding=encoding, errors=errors)

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
