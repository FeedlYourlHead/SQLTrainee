from rest_framework import serializers
from task_checker.models import Category
from task_checker.serializers import CategorySerializer
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
