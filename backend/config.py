import os

from dotenv import load_dotenv


load_dotenv()

GPT_KEY = str(os.getenv('GPT_KEY'))
