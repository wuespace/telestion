import asyncio
import json

from telestion.backend import lib
from telestion.backend.config import build_config, TelestionConfig
from telestion.backend.lib import start_service, Options


async def main():
    import sys
    # Put dev server address here for testing
    sys.argv.extend(['--dev', '--NATS_URL', 'nats://localhost:4222'])
    _config = build_config(TelestionConfig)
    print(_config)
    service = await start_service(Options().with_overwrite_args(test="foo"))
    inbox = service.nc.new_inbox()
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
