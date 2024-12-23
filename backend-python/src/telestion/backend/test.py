import asyncio
import json
import os

from telestion.backend import lib
from telestion.backend.config import build_config, TelestionConfig
from telestion.backend.lib import start_service


async def main():
    import sys
    # Put dev server address here for testing
    sys.argv.extend(['--NATS_URL', 'nats://localhost:4222', '--TEST', 'abc', '--SERVICE_NAME', "my-service", "--DATA_DIR", "/data"])
    os.environ['TEST'] = "def"
    _config = build_config(TelestionConfig)
    print(_config)
    service = await start_service(nats_disabled=True)
    print(service.config)
    # inbox = service.nc.new_inbox()
    sub = await service.subscribe('hello')
    # await service.publish('hello', b'Hello World!', reply=inbox, headers={service.config.test: 'bar'})
    await service.publish('hello', lib.json_encode({'foo': 'bar'}))
    try:
        msg = await sub.next_msg()
        print('----------------------')
        print('Subject:', msg.subject)
        print('Reply  :', msg.reply)
        print('Data   :', msg.data)
        print('Headers:', msg.header)
    except:
        ...

    await service.nc.close()
    print(service.config)


if __name__ == '__main__':
    asyncio.run(main())
