# Generated by Django 4.0.1 on 2022-09-30 10:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0005_roommember_transcript'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roommember',
            name='transcript',
            field=models.CharField(blank=True, max_length=10000),
        ),
    ]
