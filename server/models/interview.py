from tortoise.models import Model
from tortoise import fields

class Interview(Model):
    id = fields.IntField(pk=True)
    status = fields.CharField(max_length=20)
    created_at = fields.DatetimeField(auto_now_add=True)

    user = fields.ForeignKeyField("models.User", related_name="user_interview", on_delete=fields.CASCADE)
    job = fields.ForeignKeyField("models.Job", related_name="interview_job", on_delete=fields.CASCADE)
