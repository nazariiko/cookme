import json

import openai
from bs4 import BeautifulSoup
from config import GPT_KEY

# openai.api_key = GPT_KEY
# openai.Model.list()
#
# # model_id = 'gpt-3.5-turbo'
# model_id = 'gpt-3.5-turbo-0301'


def create_message(meal, ingredients, cousin):
    ingredients_str = ''
    for ingredient in ingredients:
        ingredients_str += f'- {ingredient}\n'
    message = f'''
Act as a professional chef. 
Make recipe for {meal} from ingredients I have at home:
{ingredients_str.strip()}
The recipe should be {cousin}. 
The response should be JSON. 
The response should be in the following order: 
- free_text
- ingredients (in array format)
- instructions (in array format)
- serving_recommendation
- level
- preparation_time
- total_time
- category
    '''
    return message


def create_chatgpt_response(content):
    openai.api_key = GPT_KEY
    openai.Model.list()

    # model_id = 'gpt-3.5-turbo'
    model_id = 'gpt-3.5-turbo-0301'

    conversation = []
    conversation.append({'role': 'system', 'content': content})
    print(111111)
    response = json.loads(openai.ChatCompletion.create(
        model=model_id,
        messages=conversation
    )['choices'][0]['message']['content'])
    print(2222222)

    ingredients_str = ''
    for ingredient in response['ingredients']:
        ingredients_str += f'{ingredient}, '
    ingredients_str = ingredients_str[:-2]
    response['ingredients'] = ingredients_str

    instructions_str = ''
    for instruction in response['instructions']:
        instructions_str += f'{instruction} \n'
    instructions_str = instructions_str[:-2]
    response['instructions'] = instructions_str

    # soup = BeautifulSoup(response, features="html.parser")
    # container = str(soup.find('div', {'class': 'container'})).replace('\n', '')
    return response


def create_dall_e_response(name, serving):
    openai.api_key = GPT_KEY

    response = openai.Image.create(
        prompt=f'Make photo for restaurant menu: {name}, with serving: {serving}',
        n=1,
        size="512x512"
    )
    image_url = response['data'][0]['url']
    return image_url
