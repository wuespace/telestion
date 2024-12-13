import json
import os
import tempfile
from os import unlink


def setup_nats_config(context):
    [_fd, nats_config_file] = tempfile.mkstemp("backend-features-nats.conf", text=True)
    context.nats_config_file = nats_config_file
    reset_nats_config(context)


def teardown_nats_config(context):
    assert hasattr(context, 'nats_config_file')

    if 'VERBOSE' in os.environ and os.environ['VERBOSE']:
        print(f"Removing NATS config file: {context.nats_config_file}")
        print(f"Contents of NATS config file: {open(context.nats_config_file).read()}")

    unlink(context.nats_config_file)


def write_nats_config(context):
    assert hasattr(context, 'nats_config_file')
    assert isinstance(context.nats_config_file, str)
    assert hasattr(context, 'nats_config')
    assert isinstance(context.nats_config, dict)

    with open(context.nats_config_file, 'w') as f:
        # noinspection PyTypeChecker
        json.dump(context.nats_config, f)


def reset_nats_config(context):
    context.nats_config = {}
    write_nats_config(context)


def update_nats_config(context, config):
    assert isinstance(config, dict)
    assert hasattr(context, 'nats_config')
    assert isinstance(context.nats_config, dict)

    context.nats_config.update(config)
    write_nats_config(context)
