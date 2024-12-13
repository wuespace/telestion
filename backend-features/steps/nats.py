from behave import given

from docker_lib import restart_nats, nats_online, nats_offline
from nats_config import update_nats_config


@given(u'I have a NATS server running on "{host}"')
def nats_server(context, host):
    update_nats_config(context, {'listen': host})
    restart_nats(context)
    nats_online(context)


@given(u'the NATS server requires authentication')
def nats_server_auth(context):
    update_nats_config(context, {'authorization': {
        'user': 'nats',
        'password': 'SOME_UNKNOWN_SECRET_PASSWORD_UNTIL_PROPER_USER_IS_SET_UP'
    }})
    restart_nats(context)


@given(u'"{username}" is a NATS user with password "{password}"')
def nats_server_user_credentials(context, username, password):
    update_nats_config(context, {'authorization': {'user': username, 'password': password}})
    restart_nats(context)


@given(u'the NATS server is offline')
def no_nats_server(context):
    nats_offline(context)
