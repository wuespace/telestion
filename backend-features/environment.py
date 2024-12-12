import uuid

import docker


def before_all(context):
    # exit(1)
    context.docker = docker.from_env()
    context.prefix = generate_prefix()


def after_scenario(context, scenario):
    for container in context.docker.containers.list(all=True):
        if container.name.startswith(context.prefix):
            container.remove(force=True)
    for network in context.docker.networks.list():
        if network.name.startswith(context.prefix):
            network.remove()


def generate_prefix():
    return 'telestion-backend-features-' + str(uuid.uuid4()) + '-'
