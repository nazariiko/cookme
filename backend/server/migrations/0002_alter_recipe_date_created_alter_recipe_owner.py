# Generated by Django 4.2.1 on 2023-06-01 10:42

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2023, 6, 1, 10, 42, 16, 378714)),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='owner',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
