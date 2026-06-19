from rest_framework import viewsets, status, parsers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from task_checker.views import IsAdminOrReadOnly
from .models import Article, UploadedImage
from .serializers import ArticleSerializer, UploadImageSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('category').all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]


@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_image(request):
    serializer = UploadImageSerializer(data=request.data)
    if serializer.is_valid():
        obj = serializer.save(uploaded_by=request.user)
        return Response({'url': obj.image.url}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
