import asyncio
import json
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from telestion.backend.lib import start_service


async def main():
    result = {
        "started": False,
        "nats_api_available": False,
        "nats_connected": False,
        "env": dict(os.environ)
    }

    try:
        nats_connection_options = {
            "allow_reconnect": False,       # only try to connect once
            "max_reconnect_attempts": 0,    # test
            "connect_timeout": 1,           # fail after 1 sec.
            "pedantic": True,
            "verbose": True,
        }
        service = await start_service(
            nats_disabled=os.getenv("X_DISABLE_NATS") == "1",
            nats_connecting_options=nats_connection_options
        )
        result["started"] = True
        result["config"] = service.config.model_dump(by_alias=True, mode='json', exclude_none=True)

        if (nc := service.nc) is not None:
            result["nats_api_available"] = True
            result["nats_connected"] = nc.is_connected
            if nc.is_connected:
                await nc.close()
    except BaseException as e:
        result["error"] = str(e)
    finally:
        print(json.dumps(result))
        exit(0)


if __name__ == '__main__':
    # sys.argv.extend([
    #     "--dev",
    #     "--NATS_URL=nats:4222",
    #     "--NATS_USER=nats",
    #     "--NATS_PASSWORD=password",
    # ])
    # asyncio.run(main())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.wait_for(main(), 1))    # fail automatically after one second
