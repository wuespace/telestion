from os.path import exists

import docker


def setup_nats(context):
    # assert isinstance(context.docker, docker.client.DockerClient)
    # assert exists(context.prefix)

    context.docker.networks.create(nats_network_name(context))
    context.docker.containers.run(
        'nats:latest',
        detach=True,
        name=nats_container_name(context),
    )
    nats_network = context.docker.networks.get(nats_network_name(context))
    nats_network.connect(nats_container_name(context))


def nats_container_name(context):
    return 'g-' + context.prefix + 'nats-server'


def nats_network_name(context):
    return 'g-' + context.prefix + 'nats'


def teardown_nats(context):
    # assert isinstance(context.docker, docker.client.DockerClient)
    # assert exists(context.prefix)

    context.docker.containers.get(nats_container_name(context)).stop()
    context.docker.containers.get(nats_container_name(context)).remove()
    nats_network = context.docker.networks.get(nats_network_name(context))
    nats_network.remove()


def nats_online(context):
    assert isinstance(context.docker, docker.DockerClient)

    network = context.docker.networks.get(nats_network_name(context))
    if nats_container_name(context) in [container.name for container in context.docker.containers.list()]:
        return

    network.connect(nats_container_name(context))


def nats_offline(context):
    assert isinstance(context.docker, docker.DockerClient)

    context.docker.networks.get(nats_network_name(context)).disconnect(nats_container_name(context))
