from django.http.response import JsonResponse as Response
from django.utils.dateformat import format

HTTP_400_BAD_REQUEST = 400


def dt_to_unix(value):
    return int(format(value, 'U'))


# def list_ordering(value):
#     if value[-1:] == ',':
#         value = value[:-1]
#     value = value
#     return [''.join(x) for x in value.split(',')].pop()


def ErrorResponse(code=HTTP_400_BAD_REQUEST,
                  msg=u'Something wrong'):
    """
    :param code: type about HTTP codes
    :param msg: message for output in json file
    :return: Response JSON
    """
    data = {'statusCode': code, 'message': msg}
    return Response(data, status=code)
