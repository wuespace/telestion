import uuid
import docker
from docker_lib import *
from nats_config import reset_nats_config, setup_nats_config, teardown_nats_config


def before_all(context):
    # Setup context variables
    context.docker = docker.from_env()
    context.prefix = generate_prefix()
    context.environment = {}
    # Setup the environment
    setup_nats_config(context)
    setup_nats(context)
    setup_testbed(context)


def after_all(context):
    # Teardown the environment
    teardown_nats(context)
    teardown_nats_config(context)

def before_scenario(context, scenario):
    reset_nats_config(context)

def generate_prefix():
    """
    Generate a unique prefix for the test run to avoid name collisions in docker objects
    :return: a unique prefix in the format 'telestion-backend-features-<uuid>-'
    """
    return 'telestion-backend-features-' + str(uuid.uuid4()) + '-'
