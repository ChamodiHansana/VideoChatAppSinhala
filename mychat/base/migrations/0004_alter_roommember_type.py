# Generated by Django 4.0.1 on 2022-09-22 15:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0003_roommember_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roommember',
            name='type',
            field=models.CharField(max_length=200),
        ),
    ]
