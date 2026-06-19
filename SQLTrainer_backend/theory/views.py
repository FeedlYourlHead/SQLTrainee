from rest_framework import viewsets
from task_checker.views import IsAdminOrReadOnly
from .models import Article
from .serializers import ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('category').all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
