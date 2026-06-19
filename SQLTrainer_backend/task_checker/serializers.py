from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Task, Submission
from theory.models import Article


class ArticleSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class LeaderboardSerializer(serializers.ModelSerializer):
    solved_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'solved_count']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    related_articles = ArticleSummarySerializer(many=True, read_only=True)
    related_article_ids = serializers.PrimaryKeyRelatedField(
        queryset=Article.objects.all(), source='related_articles',
        many=True, write_only=True, required=False
    )

    class Meta:
        model = Task
        fields = [
            'id', 'name', 'description', 'expected_query', 'schema_sql',
            'category', 'category_id', 'difficulty', 'is_published', 'hints',
            'related_article_ids', 'related_articles', 'verification_query', 'created_at',
        ]
        read_only_fields = ['created_at']


class TaskListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'expected_query', 'schema_sql', 'category', 'difficulty', 'is_published', 'hints', 'related_articles', 'verification_query', 'created_at']


class SubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = '__all__'


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['user_query']
