from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import requests


async def image_checker(requirements: str, image_b64):
    print("image analyzer starts")
    processor = Blip2Processor.from_pretrained("Salesforce/blip2-flan-t5-base")
    model = Blip2ForConditionalGeneration.from_pretrained(
        "Salesforce/blip2-flan-t5-base"
    )
    prompt = requirements
    inputs = processor(images=image_b64, text=prompt, return_tensors="pt")
    out = model.generate(**inputs)
    result = processor.decode(out[0], skip_special_tokens=True)
    return result
