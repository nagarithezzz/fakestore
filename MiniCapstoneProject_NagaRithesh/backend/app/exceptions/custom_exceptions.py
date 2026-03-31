from fastapi import HTTPException, status


class AppHTTPException(HTTPException):
    pass


def not_found(detail: str = "Not found") -> AppHTTPException:
    return AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def forbidden(detail: str = "Forbidden") -> AppHTTPException:
    return AppHTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def bad_request(detail: str) -> AppHTTPException:
    return AppHTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def unauthorized(detail: str = "Unauthorized") -> AppHTTPException:
    return AppHTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
