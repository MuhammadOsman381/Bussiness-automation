import models 
from tortoise.models import Model
from tortoise import fields  
from enum import Enum

class Time(str, Enum):
    FULL_TIME = "Full Time"
    PART_TIME = "Part Time"

class Job(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    description=fields.CharField(max_length=12000)
    time = fields.CharEnumField(Time, max_length=10)
    form_fields = fields.JSONField()
    created_at = fields.DatetimeField(auto_now_add=True)

    user = fields.ForeignKeyField("models.User", related_name="jobs", on_delete=fields.CASCADE)
    interview: fields.ReverseRelation["models.Interview"]

