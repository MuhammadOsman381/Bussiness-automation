from tortoise import Tortoise
import os


async def lifespan(_):
    await Tortoise.init(
        db_url=os.environ.get("DATABASE_URL"),
        modules={
            "models": [
                "models.user",
                "models.checklist",
                "models.job",
                "models.application",
                "models.interview",
                "models.prescreeninterview",
                "models.document",
            ]
        },
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()
