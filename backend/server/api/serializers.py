from rest_framework import serializers
from rest_framework.fields import SerializerMethodField

from server.models import Recipe, GPTAnswer


class GPTAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPTAnswer
        fields = '__all__'

    def create(self, validated_data):
        return GPTAnswer.objects.create(**validated_data)


class RecipesBaseSerializer(serializers.ModelSerializer):

    gpt_answer = GPTAnswerSerializer(many=False, read_only=False)

    class Meta:
        model = Recipe
        fields = '__all__'

    def create(self, validated_data):
        gpt_answer = GPTAnswer.objects.create(free_text=validated_data['gpt_answer']['free_text'],
                                              ingredients=validated_data['gpt_answer']['ingredients'],
                                              instructions=validated_data['gpt_answer']['instructions'],
                                              serving_recommendation=validated_data['gpt_answer']['serving_recommendation'],
                                              level=validated_data['gpt_answer']['level'],
                                              preparation_time=validated_data['gpt_answer']['preparation_time'],
                                              total_time=validated_data['gpt_answer']['total_time'],
                                              category=validated_data['gpt_answer']['category'])

        recipe = Recipe.objects.create(user_input_meal=validated_data['user_input_meal'],
                                       user_input_ingredients=validated_data['user_input_ingredients'],
                                       user_input_cousin=validated_data['user_input_cousin'],
                                       owner=validated_data['owner'],
                                       gpt_answer=gpt_answer,
                                       dall_e_image=validated_data['dall_e_image'])
        return recipe


class RecipesSerializer(RecipesBaseSerializer):

    dall_e_image = serializers.SerializerMethodField()

    def get_dall_e_image(self, recipe):
        request = self.context.get('request')
        dall_e_image_url = recipe.dall_e_image.url
        return request.build_absolute_uri(dall_e_image_url)


class RecipesCreateSerializer(RecipesBaseSerializer):

    dall_e_image = serializers.URLField()
