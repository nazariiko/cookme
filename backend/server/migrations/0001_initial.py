# Generated by Django 4.2.1 on 2023-05-30 11:49

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GPTAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('free_text', models.CharField(max_length=255)),
                ('ingredients', models.TextField()),
                ('instructions', models.TextField()),
                ('serving_recommendation', models.TextField()),
                ('level', models.CharField(max_length=255)),
                ('preparation_time', models.CharField(max_length=255)),
                ('total_time', models.CharField(max_length=255)),
                ('category', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_input_meal', models.CharField(max_length=255)),
                ('user_input_ingredients', models.CharField(max_length=255)),
                ('user_input_cousin', models.CharField(max_length=255)),
                ('date_created', models.DateTimeField(default=datetime.datetime(2023, 5, 30, 11, 49, 9, 429773))),
                ('owner', models.CharField(max_length=255)),
                ('gpt_answer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.gptanswer')),
            ],
        ),
    ]
