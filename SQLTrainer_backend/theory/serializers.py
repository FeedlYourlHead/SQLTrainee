from rest_framework import serializers
from task_checker.models import Category
from task_checker.serializers import CategorySerializer
from .models import Article, UploadedImage


class RelatedTaskSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category', write_only=True, required=False, allow_null=True
    )
    related_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_related_tasks(self, obj):
        tasks = obj.related_tasks.all()
        return RelatedTaskSerializer(tasks, many=True).data


class UploadImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
