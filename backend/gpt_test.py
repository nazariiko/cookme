import openai
import json
import urllib.request
from datetime import datetime

from config import GPT_KEY


content = f'''
Act as a professional chef. 
Make recipe for launch from ingredients I have at home: 
- olive oil 
- butter 
- lemon 
- milk 
- rice 
- cinnamon 
- potato 
The recipe should be Japanese. 
The response should be JSON. 
The response should be in the following order:
- name 
- free_text
- ingredients (in array format)
- instructions (in array format)
- serving_recommendation
- level
- preparation_time
- total_time
- category
'''


def create_chatgpt_response(content):
    openai.api_key = GPT_KEY
    openai.Model.list()

    model_id = 'gpt-3.5-turbo'
    # model_id = 'gpt-3.5-turbo-0301'

    conversation = []
    conversation.append({'role': 'user', 'content': content})
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
    print(response)
    return response


def create_dall_e_response(name, serving):
    openai.api_key = GPT_KEY

    response = openai.Image.create(
        # prompt=f'Make delicious photo of recipe: {name}',
        prompt=f'Make photo for restaurant menu: {name}, with serving: {serving}',
        n=1,
        size="512x512"
    )
    image_url = response['data'][0]['url']
    return image_url
    # urllib.request.urlretrieve(image_url, f'media/{datetime.timestamp(datetime.now())}.png')
    # print(image_url)
    # return image_url


recipe = create_chatgpt_response(content)
create_dall_e_response(recipe['name'], recipe['serving_recommendation'])
