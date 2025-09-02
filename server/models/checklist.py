from tortoise.models import Model
from tortoise import fields

class CheckList(Model):
    id = fields.IntField(pk=True)
    check_list = fields.JSONField()

    job = fields.ForeignKeyField(
        "models.Job", related_name="job_checklist", on_delete=fields.CASCADE
    )
