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
        service = await start_service(nats_disabled=os.getenv("X_DISABLE_NATS") == "1")
        result["started"] = True
        result["config"] = service.config.model_dump(by_alias=True, mode='json', exclude_none=True)

        if (nc := service.nc) is not None:
            result["nats_api_available"] = True
            result["nats_connected"] = nc.is_connected
    except BaseException as e:
        result["error"] = str(e)
    finally:
        print(json.dumps(result))
        exit(0)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(asyncio.wait_for(main(), 1))
