# This file was auto-generated by Fern from our API Definition.

from ...core.pydantic_utilities import UniversalBaseModel
import typing
from .send_message_to import SendMessageTo
from .send_message_cc import SendMessageCc
from .send_message_bcc import SendMessageBcc
from .message_text import MessageText
from .message_html import MessageHtml
from ...core.pydantic_utilities import IS_PYDANTIC_V2
import pydantic


class ReplyToMessageRequest(UniversalBaseModel):
    to: typing.Optional[SendMessageTo] = None
    cc: SendMessageCc
    bcc: SendMessageBcc
    text: MessageText
    html: MessageHtml

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(
            extra="allow", frozen=True
        )  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow
