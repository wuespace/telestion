import argparse
import json
import os
from pathlib import Path
from typing import Any, TypeVar

from pydantic import BaseModel, Field, ConfigDict


class TelestionConfig(BaseModel):
    dev: bool = False
    nats_url: str = Field(alias="NATS_URL")
    nats_user: str | None = Field(alias="NATS_USER", default=None)
    nats_password: str | None = Field(alias="NATS_PASSWORD", default=None)
    config_file: Path | None = Field(alias="CONFIG_FILE", default=None)
    config_key: str | None = Field(alias="CONFIG_KEY", default=None)
    service_name: str = Field(alias="SERVICE_NAME")
    data_dir: Path = Field(alias="DATA_DIR")

    unparsed_cli: list[str] = Field(alias="_telestion_validator_unparsed_cli")

    # To include all envs and config parts -> it is recommended to add a custom subtype
    model_config = ConfigDict(
        extra='allow'
    )


# With this we allow users to extend TelestionConfig for finer control over custom config fields
_TelestionConfigT = TypeVar("_TelestionConfigT", bound=TelestionConfig)


def build_config(clazz: type[_TelestionConfigT] = None) -> _TelestionConfigT:
    if clazz is None:
        clazz = TelestionConfig

    cli_args, additional_args = _parse_cli()

    def _from_env_or_cli(key: str):
        return cli_args.get(key, os.environ.get(key, None))

    config_path = _from_env_or_cli('CONFIG_FILE')
    config_key = _from_env_or_cli('CONFIG_KEY')

    config_assembly: dict[str, Any] = dict()
    if 'dev' in cli_args and cli_args['dev']:
        # 1. Add default config
        config_assembly.update(defaults())

    if config_path is not None:
        config_path = Path(config_path)
        # 2. Insert config file
        config_assembly.update(_parse_config_file(config_path, config_key))

    # 3. Add Environment Variables
    config_assembly.update(os.environ)

    # 4. Add CLI args
    config_assembly.update(cli_args)

    # 5. Add args that cannot be parsed by the pipeline, i.e. service specific config
    config_assembly['_telestion_validator_unparsed_cli'] = additional_args

    return clazz(**config_assembly)


def defaults() -> dict[str, Any]:
    return {
        'NATS_URL': "nats://localhost:4222",
        'SERVICE_NAME': f"dev-{os.getpid()}",
        'DATA_DIR': Path("./data")
    }


def _parse_cli() -> tuple[dict[str, Any], list[str]]:
    description = "CLI Interface for the Telestion Services. This is one way to setup your Telestion application."
    epilog = "For more information please visit https://github.com/wuespace/telestion or \
    https://telestion.wuespace.de/"
    parser = argparse.ArgumentParser(
        description=description,
        epilog=epilog,
        prog="Telestion-CLI (Python)",
        argument_default=argparse.SUPPRESS
    )

    parser.add_argument("--dev", action='store_true', help="If set, program will start in development mode")
    parser.add_argument("--version", action='version', version="%(prog)s v1.0-alpha")

    parser.add_argument("--NATS_URL", help="NATS url of the server the service can connect to")
    parser.add_argument("--NATS_USER", help="NATS user name for the authentication with the server")
    parser.add_argument("--NATS_PASSWORD", help="NATS password for the authentication with the server \
    (Note: It is recommended to set this via the environment variables or the config!)")

    parser.add_argument("--CONFIG_FILE", help="file path to the config of the service", type=Path)
    parser.add_argument("--CONFIG_KEY", help="object key of a config file")

    parser.add_argument("--SERVICE_NAME", help="name of the service also used in the nats service registration")
    parser.add_argument("--DATA_DIR", help="path where the service can store persistent data", type=Path)

    namespace, args = parser.parse_known_args()
    return vars(namespace), args


def _parse_config_file(config_p: Path, key: str = None) -> dict[str, Any]:
    with open(config_p, 'r') as config_f:
        content = json.load(config_f)

    if key is None:
        return content

    return content[key]
