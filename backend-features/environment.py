import uuid
import docker

from docker_lib import setup_nats, teardown_nats


def before_all(context):
    # exit(1)
    context.docker = docker.from_env()
    context.prefix = generate_prefix()
    setup_nats(context)


def after_all(context):
    teardown_nats(context)


def after_scenario(context, scenario):
    for container in context.docker.containers.list(all=True):
        if container.name.startswith(context.prefix):
            container.remove(force=True)


def generate_prefix():
    return 'telestion-backend-features-' + str(uuid.uuid4()) + '-'
