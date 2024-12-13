import json
import os
from os.path import dirname

import jsonschema
from docker.client import DockerClient
from docker.models.images import Image

from lib.nats_container import nats_network_name


def setup_testbed(context):
    """
    Build the testbed image
    :param context: The context, including the Docker client.
    The testbed image will be stored in the context.
    """
    assert isinstance(context.docker, DockerClient)

    assert 'TELESTION_TESTBED_PATH' in os.environ, "Testbed path must be set (TELESTION_TESTBED_PATH)"
    assert isinstance(os.environ['TELESTION_TESTBED_PATH'], str), "Testbed path must be a string"
    assert os.path.exists(os.environ['TELESTION_TESTBED_PATH']), \
        f"Testbed path does not exist: {os.environ['TELESTION_TESTBED_PATH']}"

    [image, build_output] = context.docker.images.build(path=os.environ['TELESTION_TESTBED_PATH'])
    if 'VERBOSE' in os.environ and os.environ['VERBOSE']:
        print("=== Build Output ===")
        for line in build_output:
            if 'stream' in line:
                print(line['stream'], end='')
        print("=== END Build Output ===")

    context.testbed = image


def run_testbed(context, cmd="", disable_nats=False) -> dict:
    """
    Run a command in the testbed container
    :param context: the context, including the Docker client
    :param cmd: the command to run.
    Default is an empty string
    :param disable_nats: Starts the service in the no-NATS mode
    :return: The JSON output of the command
    """
    assert hasattr(context, 'docker'), 'Docker client is required for this step'
    assert isinstance(context.docker, DockerClient), 'Docker client must be an instance of DockerClient'
    assert hasattr(context, 'testbed'), 'Testbed image is required for this step'
    assert isinstance(context.testbed, Image), 'Testbed image must be an instance of Image'
    assert hasattr(context, 'environment'), 'Environment variables are required for this step'
    assert isinstance(context.environment, dict), 'Environment variables must be a dictionary'
    assert isinstance(cmd, str), 'Command must be a string'

    env = context.environment.copy()
    env['X_DISABLE_NATS'] = '1' if disable_nats else '0'

    try:
        result = context.docker.containers.run(
            context.testbed,
            cmd,
            environment=env,
            auto_remove=True,
            network=nats_network_name(context),
        ).splitlines()[-1].decode()

        print(f"Result: {result}")

        json_result = json.loads(result)

        assert isinstance(json_result, dict)
        validate_testbed_result(json_result)

        context.result = json_result

        return json_result
    except Exception as e:
        print(f"Error: {e}")
        return {}


fp = os.path.join(dirname(__file__), 'test-result.schema.json')
with open(fp) as f:
    schema = json.load(f)


def validate_testbed_result(result):
    jsonschema.validate(result, schema)
