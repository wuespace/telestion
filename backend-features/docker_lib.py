import json

from docker.client import DockerClient
from docker.models.images import Image


def setup_nats(context):
    """
    Initialize the NATS server container and network
    :param context: The context, including the Docker client.
    """
    assert isinstance(context.docker, DockerClient)
    assert hasattr(context, 'nats_config_file')

    nats_network = context.docker.networks.create(nats_network_name(context))
    context.docker.containers.run(
        'nats:latest',
        '-c /nats/nats.conf',
        detach=True,
        name=nats_container_name(context),
        network=nats_network.name,
        hostname='nats',
        volumes=[
            f"{context.nats_config_file}:/nats/nats.conf:ro"
        ],
    )


def restart_nats(context):
    """
    Restart the NATS server container
    :param context: The context, including the Docker client.
    """
    assert isinstance(context.docker, DockerClient)

    context.docker.containers.get(nats_container_name(context)).restart()


def nats_container_name(context):
    """
    Get the name of the NATS container
    :param context: The context, including the prefix for Docker Object Names.
    :return: The name of the NATS container
    """
    assert hasattr(context, 'prefix')
    assert isinstance(context.prefix, str)
    return 'g-' + context.prefix + 'nats-server'


def nats_network_name(context):
    """
    Get the name of the NATS network
    :param context: The context, including the prefix for Docker Object Names
    :return: The name of the NATS network
    """
    assert hasattr(context, 'prefix')
    assert isinstance(context.prefix, str)
    return 'g-' + context.prefix + 'nats'


def teardown_nats(context):
    assert isinstance(context.docker, DockerClient)

    context.docker.containers.get(nats_container_name(context)).stop()
    # Output NATS logs – useful for debugging:
    # print(context.docker.containers.get(nats_container_name(context)).logs().decode())
    context.docker.containers.get(nats_container_name(context)).remove()
    nats_network(context).remove()


def nats_online(context):
    """
    Connect the NATS container to the network
    :param context: The context, including the Docker client.
    """
    network = nats_network(context)

    if nats_container_name(context) in [
        container.name
        for container
        in network.containers
    ]: return  # already connected

    network.connect(nats_container_name(context), aliases=['nats'])
    restart_nats(context)


def nats_offline(context):
    """
    Disconnect the NATS container from the network
    :param context: The context, including the Docker client.
    """
    assert isinstance(context.docker, DockerClient)
    nats_network(context).disconnect(nats_container_name(context))


def nats_network(context):
    """
    Get the NATS network
    :param context: The context, including the Docker client.
    :return: The NATS network object
    """
    assert isinstance(context.docker, DockerClient)
    return context.docker.networks.get(nats_network_name(context))


def setup_testbed(context):
    """
    Build the testbed image
    :param context: The context, including the Docker client.
    The testbed image will be stored in the context.
    """
    assert isinstance(context.docker, DockerClient)

    [image, _output] = context.docker.images.build(path='./sample-service')
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

        context.result = json_result

        return json_result
    except Exception as e:
        print(f"Error: {e}")
        return {}
