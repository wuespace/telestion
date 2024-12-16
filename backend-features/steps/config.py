from behave import given


@given(u'I have the basic service configuration')
def basic_service_configuration(context):
    environment_variable(context, 'NATS_URL', 'nats://nats:4222')
    environment_variable(context, 'NATS_USER', 'nats')
    environment_variable(context, 'NATS_PASSWORD', 'nats')
    environment_variable(context, 'SERVICE_NAME', 'my-service')
    environment_variable(context, 'DATA_DIR', '/data')


@given(u'I have no service configuration')
def no_service_configuration(context):
    context.environment = {}


@given(u'I have an environment variable named "{key}" with value "{value}"')
def environment_variable(context, key, value):
    if not hasattr(context, 'environment'):
        context.environment = {}
    context.environment[key] = value
