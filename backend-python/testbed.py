import json
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from telestion.backend.config import build_config, TelestionConfig
from telestion.backend.lib import start_service


async def main():
    _config = build_config(TelestionConfig)

    result = {
        "started": False,
        "nats_api_available": False,
        "nats_connected": False,
        "env": dict(os.environ)
    }

    try:
        service = await start_service(nats_disabled=os.getenv("X_DISABLE_NATS") == "1")
        result["started"] = True
        result["config"] = service.config

        if (nc := service.nc) is not None:
            result["nats_api_available"] = True
            result["nats_connected"] = nc.is_connected
    except Exception as e:
        result["error"] = str(e)

    print(json.dumps(result))
    exit(0)


if __name__ == '__main__':
    main()
