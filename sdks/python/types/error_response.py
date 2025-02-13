# This file was auto-generated by Fern from our API Definition.

from ..core.pydantic_utilities import UniversalBaseModel
from .error_name import ErrorName
import pydantic
from ..core.pydantic_utilities import IS_PYDANTIC_V2
import typing


class ErrorResponse(UniversalBaseModel):
    name: ErrorName
    message: str = pydantic.Field()
    """
    Error message.
    """

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(
            extra="allow", frozen=True
        )  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow
