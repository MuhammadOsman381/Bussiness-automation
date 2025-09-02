from tortoise.models import Model
from tortoise import fields

class Application(Model):
    id = fields.IntField(pk=True)
    form_fields = fields.JSONField() 
    created_at = fields.DatetimeField(auto_now_add=True)

    user = fields.ForeignKeyField("models.User", related_name="applicant", on_delete=fields.CASCADE)
    job = fields.ForeignKeyField("models.Job", related_name="job_applicant", on_delete=fields.CASCADE)



