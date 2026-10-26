from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler that returns consistent error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'error': True,
            'status_code': response.status_code,
            'detail': response.data,
        }
        response.data = custom_response
    else:
        # Unhandled exception - return 500 without exposing stack trace
        return Response(
            {
                'error': True,
                'status_code': 500,
                'detail': 'An internal server error occurred.',
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
