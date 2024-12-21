import os

from docker.client import DockerClient


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
    if 'VERBOSE' in os.environ and os.environ['VERBOSE']:
        print("=== NATS Logs ===")
        print(context.docker.containers.get(nats_container_name(context)).logs().decode())
        print("=== END NATS Logs ===")
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

    network.connect(nats_container_name(context))
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

