from tortoise.models import Model
from tortoise import fields

class Interview(Model):
    id = fields.IntField(pk=True)
    status = fields.CharField(max_length=20)
    qa = fields.JSONField()
    created_at = fields.DatetimeField(auto_now_add=True)
    user = fields.ForeignKeyField("models.User", related_name="user_interview", on_delete=fields.CASCADE)
