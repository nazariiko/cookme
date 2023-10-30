import json

from django.db.models import Q
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, mixins, status
from server.models import Recipe

from .pagination import MyPagination
from .serializers import RecipesSerializer, RecipesCreateSerializer, RecipesBaseSerializer
from services.gpt import create_message, create_chatgpt_response, create_dall_e_response

"""
ALL api calls are protected by refresh token token, you have to ADD Bearer Token to your call.
You can generate JWT token by POST request to localhost:8000/api/token/.
You can refresh JWT token by POST request to localhost:8000/api/token/refresh.
"""


class RecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipesSerializer
    # permission_classes = (IsAuthenticated,)
    pagination_class = MyPagination

    def get_queryset(self):
        owner = self.request.query_params.get('owner')
        if owner is not None:
            return Recipe.objects.filter(owner=self.request.query_params['owner'])
        else:
            return Recipe.objects.all()


class RecipeCreateViewSet(viewsets.ModelViewSet):
    serializer_class = RecipesCreateSerializer
    # permission_classes = (IsAuthenticated,)
    pagination_class = MyPagination

    def create(self, request, *args, **kwargs):
        content = create_message(request.data['meal'], request.data['ingredients'], request.data['cousin'])
        gpt_response = create_chatgpt_response(content)
        dall_e_response = create_dall_e_response(gpt_response['free_text'], gpt_response['serving_recommendation'])

        ingredients_str = ''
        for ingredient in request.data['ingredients']:
            ingredients_str += f'{ingredient}, '
        ingredients_str = ingredients_str[:-2]
        data = {'user_input_meal': request.data['meal'],
                'user_input_ingredients': ingredients_str,
                'user_input_cousin': request.data['cousin'],
                'owner': request.data['owner'],
                'gpt_answer': gpt_response,
                'dall_e_image': dall_e_response}
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # if request.data['owner'] != '':
            #     serializer.save()
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeSaveViewSet(viewsets.ModelViewSet):
    serializer_class = RecipesBaseSerializer
    # permission_classes = (IsAuthenticated,)
    pagination_class = MyPagination

    def create(self, request, *args, **kwargs):
        dall_e_image = request.data['image']
        json_data = json.loads(request.data['json'])
        if Recipe.objects.filter(owner=json_data['owner']).count() >= 10:
            return Response({'error': 'limit_10_saved_recipes'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            data = {'user_input_meal': json_data['user_input_meal'],
                    'user_input_ingredients': json_data['user_input_ingredients'],
                    'user_input_cousin': json_data['user_input_cousin'],
                    'owner': json_data['owner'],
                    'gpt_answer': json_data['gpt_answer'],
                    'dall_e_image': dall_e_image}
            serializer = self.serializer_class(data=data)
            if serializer.is_valid():
                if json_data['owner'] != '':
                    serializer.save()
                return Response(data=serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeFilterViewSet(viewsets.ModelViewSet):
    serializer_class = RecipesSerializer
    # permission_classes = (IsAuthenticated,)
    pagination_class = MyPagination

    def get_queryset(self):
        owner = self.request.query_params.get('owner')
        if owner is not None:
            recipes = Recipe.objects.filter(owner=self.request.query_params['owner'])
        else:
            recipes = Recipe.objects.all()
        level = self.request.query_params.get('level')
        if level is not None:
            recipes = recipes.filter(Q(gpt_answer__level__iexact=self.request.query_params['level']))
        category = self.request.query_params.get('category')
        if category is not None:
            recipes = recipes.filter(Q(gpt_answer__category__iexact=self.request.query_params['category']))
        cousin = self.request.query_params.get('cousin')
        if cousin is not None:
            recipes = recipes.filter(Q(user_input_cousin__iexact=self.request.query_params['cousin']))
        return recipes


class RecipeSearchViewSet(viewsets.ModelViewSet):
    serializer_class = RecipesSerializer
    # permission_classes = (IsAuthenticated,)
    pagination_class = MyPagination

    def get_queryset(self, *args, **kwargs):
        owner = self.request.query_params.get('owner')
        if owner is not None:
            recipes = Recipe.objects.filter(owner=self.request.query_params['owner'])
        else:
            recipes = Recipe.objects.all()
        word = self.request.query_params.get('word')
        if word is not None:
            return recipes.filter(Q(gpt_answer__ingredients__icontains=self.request.query_params['word']) |
                                  Q(gpt_answer__instructions__icontains=self.request.query_params['word']) |
                                  Q(gpt_answer__level__icontains=self.request.query_params['word']) |
                                  Q(gpt_answer__category__icontains=self.request.query_params['word']) |
                                  Q(gpt_answer__free_text__icontains=self.request.query_params['word'])).distinct()
        else:
            return recipes
