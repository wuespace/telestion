from behave import when, then

from lib.testbed import run_testbed


@when(u'I start the service')
def start_service(context):
    run_testbed(context)


@when(u'I start the service without NATS')
def start_service_without_nats(context):
    run_testbed(context, disable_nats=True)


@when(u'I start the service with "{arg}"')
def start_service_with_arg(context, arg):
    run_testbed(context, cmd=arg)


@when(u'I start the service with "{arg}" without NATS')
def start_service_with_arg_without_nats(context, arg):
    run_testbed(context, cmd=arg, disable_nats=True)


@then(u'the service should start')
def assert_service_started(context):
    assert 'result' in context, 'Service must be started before checking connection'
    assert 'started' in context.result, 'Service must be started before checking connection'
    assert context.result['started'], 'Service must be started'


@then(u'the service should connect to NATS')
def assert_service_connected(context):
    assert 'result' in context, 'Service must be started before checking connection'
    assert 'nats_connected' in context.result, 'Service must be started before checking connection'
    assert context.result['nats_connected'], 'Service must be connected to NATS'


@then(u'the service should fail to start')
def assert_service_failed(context):
    assert 'result' in context, 'Result must be available to check service status'
    assert 'started' in context.result, 'Service must be started before checking connection'
    assert not context.result['started'], 'Service must not be started'


@then(u'the service should be configured with "{key}" set to "{expected_value}"')
def assert_service_configured_with(context, key, expected_value):
    assert 'result' in context, 'Service must be started before checking connection'
    assert 'config' in context.result, ('Service must successfully start before checking connection. '
                                        'Field "config" not set in result.')
    if expected_value == "undefined":
        assert key not in context.result['config'], 'Service must be started before checking connection'
    else:
        assert key in context.result['config'], 'Service must be started before checking connection'
        assert str(context.result['config'][key]) == str(
            expected_value), f"Expected {key} to be {expected_value}, got {context.result['config'][key]}"


@then(u'the service should be configured with "{key}" set to either "{expected_value}" or "{alternative}"')
def assert_service_configured_with_alternative(context, key, expected_value, alternative):
    try:
        assert_service_configured_with(context, key, alternative)
    except AssertionError:
        assert_service_configured_with(context, key, expected_value)


@then(u'the NATS connection API should be available to the service')
def assert_nats_api_available(context):
    assert 'result' in context, 'Service must be started before checking connection'
    assert 'nats_api_available' in context.result, 'Service must be started before checking connection'
    assert context.result['nats_api_available'], 'Service must be connected to NATS'


@then(u'the service should not connect to NATS')
def assert_service_not_connected(context):
    assert 'result' in context, 'Service must be started before checking connection'
    assert 'nats_connected' in context.result, 'Service must be started before checking connection'
    assert not context.result['nats_connected'], 'Service must not be connected to NATS'
