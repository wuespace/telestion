from behave import *
from behave.api.pending_step import StepNotImplementedError


#
# nats server setup
#


@given(u'I have a NATS server running on "{host}"')
def nats_server(context, host):
    context.docker.networks.create(context.prefix + 'nats')
    context.docker.containers.run(
        'nats:latest',
        detach=True,
        name=context.prefix + 'nats-server',
    )
    context.docker.networks.get(context.prefix + 'nats').connect(context.prefix + 'nats-server')


@given(u'the NATS server requires authentication')
def nats_server_auth(context):
    context.docker.containers.get(context.prefix + 'nats-server').stop()
    context.docker.containers.get(context.prefix + 'nats-server').remove()
    context.docker.containers.run(
        'nats:latest',
        detach=True,
        name=context.prefix + 'nats-server',
        environment=['NATS_USER=nats', 'NATS_PASSWORD=nats'],
    )
    context.docker.networks.get(context.prefix + 'nats').connect(context.prefix + 'nats-server')


@given(u'"{username}" is a NATS user with password "{password}"')
def nats_server_user_credentials(context, username, password):
    context.docker.containers.get(context.prefix + 'nats-server').stop()
    context.docker.containers.get(context.prefix + 'nats-server').remove()
    context.docker.containers.run(
        'nats:latest',
        detach=True,
        name=context.prefix + 'nats-server',
        environment=['NATS_USER=' + username, 'NATS_PASSWORD=' + password],
    )
    context.docker.networks.get(context.prefix + 'nats').connect(context.prefix + 'nats-server')


@given(u'the NATS server is offline')
def no_nats_server(context):
    context.docker.containers.get(context.prefix + 'nats-server').stop()
    context.docker.containers.get(context.prefix + 'nats-server').remove()
    raise StepNotImplementedError()


#
# service setup
#


@given(u'I have the basic service configuration')
def basic_service_configuration(context):
    context.environment = {
        'NATS_URL': 'nats://localhost:4222',
        'NATS_USER': 'nats',
        'NATS_PASSWORD': 'nats',
        'SERVICE_NAME': 'my-service',
        'DATA_DIR': '/data',
    }

    pass
    # raise StepNotImplementedError()


@given(u'I have no service configuration')
def no_service_configuration(context):
    raise StepNotImplementedError()


@given(u'I have an environment variable named "{key}" with value "{value}"')
def environment_variable(context, key, value):
    if context.environment is None:
        context.environment = {}
    context.environment[key] = value


@when(u'I start the service')
def start_service(context):
    raise StepNotImplementedError()


@when(u'I start the service without NATS')
def start_service_without_nats(context):
    raise StepNotImplementedError()


@when(u'I start the service with "{arg}"')
def start_service_with_arg(context, arg):
    raise StepNotImplementedError()


@when(u'I start the service with "{arg}" without NATS')
def start_service_with_arg_without_nats(context, arg):
    raise StepNotImplementedError()


@then(u'the service should start')
def assert_service_started(context):
    raise StepNotImplementedError()


@then(u'the service should connect to NATS')
def assert_service_connected(context):
    raise StepNotImplementedError()


@then(u'the service should fail to start')
def assert_service_failed(context):
    raise StepNotImplementedError()


@then(u'the service should be configured with "{key}" set to "{expected_value}"')
def assert_service_configured_with(context, key, expected_value):
    raise StepNotImplementedError()


@then(u'the NATS connection API should be available to the service')
def assert_nats_api_available(context):
    raise StepNotImplementedError()


@then(u'the service should not connect to NATS')
def assert_service_not_connected(context):
    raise StepNotImplementedError()
