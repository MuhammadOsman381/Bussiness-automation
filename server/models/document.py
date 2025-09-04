from tortoise.models import Model
from tortoise import fields


class Document(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    name = fields.CharField(max_length=255)
    purpose = fields.CharField(max_length=10000)
    get = fields.CharField(max_length=20)
    created_at = fields.DatetimeField(auto_now_add=True)
