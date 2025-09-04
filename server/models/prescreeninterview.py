from tortoise.models import Model
from tortoise import fields  

class PreScreenInterview(Model):
    id = fields.IntField(pk=True)
    question = fields.CharField(max_length=255)
    expected_output = fields.CharField(max_length=255)
    created_at = fields.DatetimeField(auto_now_add=True)
