from typing import Any, Callable

from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse


class BaseException(Exception):
    """This is the base class for all Errors"""


class MasterNotFound(BaseException):
    """Master Not found"""


class MasterAlreadyExists(BaseException):
    """Master Already Exists"""


class IncorrectCodeFormat(BaseException):
    """Incorrect Code Format"""


class UserAlreadyExists(BaseException):
    """User Already Exists"""


class InvalidCredentials(BaseException):
    """Invalid Credentials"""


class CannotDeleteCurrentUser(BaseException):
    """Cannot delete the currently logged in user"""


class AccessTokenRequired(BaseException):
    """Please provide an Access Token"""


class RefreshTokenRequired(BaseException):
    """Please provide a Refresh Token"""


class InvalidToken(BaseException):
    """Invalid Token"""


class AccessDenied(BaseException):
    """Access Denied due to insufficient permissions"""


class UserNotFound(BaseException):
    """User Not Found"""


class IncorrectCodeFormat(BaseException):
    """Incorrect Code Format"""


class CannotChangeMasterName(BaseException):
    """Cannot change the master name once set"""


class RoadChallanNotFound(BaseException):
    """Road Challan Not Found"""



class ServiceCenterNotFound(BaseException):
    """Service Center Not Found"""


class WarrantyNotFound(BaseException):
    """Warranty Not Found"""


class OutOfWarrantyNotFound(BaseException):
    """Out Of Warranty Not Found"""


class ServiceCenterAlreadyExists(BaseException):
    """Service Center Already Exists"""

class VendorNotFound(BaseException):
    """Vendor Not Found"""

class ModelAlreadyExists(BaseException):
    """Model Already Exists"""

class ModelNotFound(BaseException):
    """Model Not Found"""


def create_exception_handler(
    status_code: int, initial_detail: Any
) -> Callable[[Request, Exception], JSONResponse]:
    async def exception_handler(request: Request, exc: BaseException):
        return JSONResponse(content=initial_detail, status_code=status_code)

    return exception_handler


def register_exceptions(app: FastAPI):
    app.add_exception_handler(
        MasterNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Customer Not Found",
                "resolution": "Please check the customer details",
                "error_code": "master_not_found",
            },
        ),
    )

    app.add_exception_handler(
        MasterAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "Customer Name Already Exists",
                "resolution": "Please choose a different customer name",
                "error_code": "master_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        UserAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "User Already Exists",
                "resolution": "Please choose a different username",
                "error_code": "user_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        InvalidCredentials,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Invalid Credentials",
                "resolution": "Please check your password",
                "error_code": "invalid_credentials",
            },
        ),
    )

    app.add_exception_handler(
        CannotDeleteCurrentUser,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Cannot Delete The Currently Logged In User",
                "resolution": "Please log in as a different user",
                "error_code": "cannot_delete_current_user",
            },
        ),
    )

    app.add_exception_handler(
        AccessTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Please provide a valid access token",
                "resolution": "Please get an access token",
                "error_code": "access_token_required",
            },
        ),
    )

    app.add_exception_handler(
        RefreshTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Please provide a valid refresh token",
                "resolution": "Please get an refresh token",
                "error_code": "refresh_token_required",
            },
        ),
    )

    app.add_exception_handler(
        InvalidToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "The provided token is invalid",
                "resolution": "Please provide a valid token",
                "error_code": "invalid_token",
            },
        ),
    )

    app.add_exception_handler(
        AccessDenied,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Access Denied due to Insufficient Permissions",
                "resolution": "Only admin users can access this resource",
                "error_code": "access_denied",
            },
        ),
    )

    app.add_exception_handler(
        UserNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "User Not Found",
                "resolution": "Please check the username",
                "error_code": "user_not_found",
            },
        ),
    )

    app.add_exception_handler(
        IncorrectCodeFormat,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Incorrect Code Format",
                "resolution": "Please provide code in correct format",
                "error_code": "incorrect_code_format",
            },
        ),
    )

    app.add_exception_handler(
        CannotChangeMasterName,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Cannot change the master name",
                "resolution": "Keep the master name unchanged",
                "error_code": "cannot_change_master_name",
            },
        ),
    )

    app.add_exception_handler(
        RoadChallanNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Road Challan Not Found",
                "resolution": "Please check the challan number",
                "error_code": "road_challan_not_found",
            },
        ),
    )

    app.add_exception_handler(
        ServiceCenterNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Service Center Not Found",
                "resolution": "Please select OTHERS option",
                "error_code": "service_center_not_found",
            },
        ),
    )

    app.add_exception_handler(
        WarrantyNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Warranty Not Found",
                "resolution": "Please check the SRF number",
                "error_code": "warranty_not_found",
            },
        ),
    )

    app.add_exception_handler(
        OutOfWarrantyNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Out Of Warranty Not Found",
                "resolution": "Please check the SRF number",
                "error_code": "out_of_warranty_not_found",
            },
        ),
    )

    app.add_exception_handler(
        ServiceCenterAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "Service Center Already Exists",
                "resolution": "Choose a different service center name",
                "error_code": "service_center_already_exists",
            },
        ),
    )

    app.add_exception_handler(
        VendorNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Vendor Not Found",
                "resolution": "Please check the vendor code",
                "error_code": "vendor_not_found",
            },
        ),
    )

    app.add_exception_handler(
        ModelNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Model Not Found",
                "resolution": "Please add model record",
                "error_code": "model_not_found",
            },
        ),
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        # Customize the error message here
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "message": "Validation error!",
                "resolution": "Please check the data provided for correctness",
                "error_code": "validation_error",
            },
        )
    
    app.add_exception_handler(
        ModelAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "Model Name Already Exists",
                "resolution": "Please choose a different model",
                "error_code": "model_already_exists",
            },
        ),
    )

    # @app.exception_handler(500)
    # async def internal_server_error(request, exc):
    #     return JSONResponse(
    #         content={
    #             "message": "Oops! Something went wrong",
    #             "error_code": "server_error",
    #         },
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #     )

    # @app.exception_handler(SQLAlchemyError)
    # async def database__error(request, exc):
    #     print(str(exc))
    #     return JSONResponse(
    #         content={
    #             "message": "Oops! Something went wrong",
    #             "error_code": "server_error",
    #         },
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #     )
