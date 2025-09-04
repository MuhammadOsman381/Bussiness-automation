from tortoise.models import Model
from tortoise import fields
from enum import Enum

class Status(str, Enum):
    AVAILABLE = "available"
    NOT_AVAILABLE = "not_available"


class CheckList(Model):
    id = fields.IntField(pk=True)
    status = fields.CharEnumField(Status, max_length=20)
    file_path = fields.CharField(max_length=255, null=True)
    user = fields.ForeignKeyField(
        "models.User", related_name="user_checklist", on_delete=fields.CASCADE
    )
    document = fields.ForeignKeyField(
        "models.Document", related_name="doc_checklist", on_delete=fields.CASCADE
    )
