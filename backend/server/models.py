import datetime

from django.db import models
from django.contrib.auth.models import User


# class Ingredient(models.Model):
#     name = models.CharField(max_length=255)
#
#
# class Measure(models.Model):
#     name = models.CharField(max_length=255)
#
#
# class AmountOfIngredients(models.Model):
#     ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
#     amount = models.FloatField()
#     measure = models.ForeignKey(Measure, on_delete=models.CASCADE)


# class Ingredient(models.Model):
#     ingredient = models.TextField()
#
#
# class Instruction(models.Model):
#     instruction = models.TextField()


class GPTAnswer(models.Model):
    free_text = models.CharField(max_length=255)
    ingredients = models.TextField()
    instructions = models.TextField()
    serving_recommendation = models.TextField()
    level = models.CharField(max_length=255)
    preparation_time = models.CharField(max_length=255)
    total_time = models.CharField(max_length=255)
    category = models.CharField(max_length=255)


class Recipe(models.Model):
    user_input_meal = models.CharField(max_length=255)
    user_input_ingredients = models.CharField(max_length=255)
    user_input_cousin = models.CharField(max_length=255)
    gpt_answer = models.ForeignKey(GPTAnswer, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now=True)
    owner = models.CharField(max_length=255, null=True, blank=True)
    # dall_e_image = models.CharField(max_length=2550)
    dall_e_image = models.ImageField()

    class Meta:
        ordering = ['-date_created']
