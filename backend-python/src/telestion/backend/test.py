import asyncio

from telestion.backend.config import build_config, TelestionConfig
from telestion.backend.lib import start_service, Options


async def main():
    import sys
    # Put dev server address here for testing
    sys.argv.extend(['--dev', '--NATS_URL', 'nats://172.21.73.221:4222'])
    _config = build_config(TelestionConfig)
    print(_config)
    service = await start_service(Options().with_overwrite_args(test="foo"))
    await service.nc.close()
    print(service.config)


if __name__ == '__main__':
    asyncio.run(main())
