# Generated by Django 4.0.1 on 2022-09-22 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_rename_member_id_roommember_uid'),
    ]

    operations = [
        migrations.AddField(
            model_name='roommember',
            name='type',
            field=models.CharField(default=True, max_length=200),
        ),
    ]