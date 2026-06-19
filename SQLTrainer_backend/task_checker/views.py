from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser

class IsAdminOrReadOnly(IsAuthenticatedOrReadOnly):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user and request.user.is_staff
from rest_framework.response import Response

from .models import Category, Task, Submission
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CategorySerializer,
    TaskSerializer,
    TaskListSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
    LeaderboardSerializer,
)
from .sql_checker import execute_query, check_query


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True)
    def stats(self, request, pk=None):
        user = self.get_object()
        total = Submission.objects.filter(user=user).count()
        correct = Submission.objects.filter(user=user, is_correct=True).count()
        solved_tasks = (
            Submission.objects.filter(user=user, is_correct=True)
            .values('task')
            .distinct()
            .count()
        )
        return Response({
            'total_submissions': total,
            'correct_submissions': correct,
            'solved_tasks': solved_tasks,
            'accuracy': round(correct / total * 100, 1) if total else 0,
        })

    @action(detail=True)
    def solved(self, request, pk=None):
        user = self.get_object()
        solved_task_ids = (
            Submission.objects.filter(user=user, is_correct=True)
            .values_list('task', flat=True)
            .distinct()
        )
        tasks = Task.objects.filter(id__in=solved_task_ids)
        serializer = TaskListSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def get_queryset(self):
        qs = Task.objects.select_related('category')
        user = self.request.user
        if not user.is_authenticated or not user.is_staff:
            qs = qs.filter(is_published=True)
        difficulty = self.request.query_params.get('difficulty')
        category_id = self.request.query_params.get('category_id')
        search = self.request.query_params.get('search')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if category_id:
            qs = qs.filter(category_id=category_id)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def run(self, request, pk=None):
        task = self.get_object()
        serializer = SubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_query = serializer.validated_data['user_query']
        try:
            columns, rows = execute_query(task.schema_sql, user_query, task.verification_query)
            return Response({'columns': columns, 'rows': rows})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        task = self.get_object()
        serializer = SubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_query = serializer.validated_data['user_query']
        is_correct, user_result, expected_result, error_message = check_query(
            task.schema_sql, user_query, task.expected_query, task.verification_query
        )
        submission = Submission.objects.create(
            user=request.user,
            task=task,
            user_query=user_query,
            is_correct=is_correct,
            error_message=error_message or '',
        )
        return Response({
            'submission': SubmissionSerializer(submission).data,
            'result': user_result,
            'expected': expected_result,
        }, status=status.HTTP_201_CREATED)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Submission.objects.none()
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user).select_related('user', 'task')


class LeaderboardView(generics.ListAPIView):
    serializer_class = LeaderboardSerializer

    def get_queryset(self):
        return (
            User.objects.annotate(
                solved_count=Count('attempts', filter=Q(attempts__is_correct=True))
            )
            .order_by('-solved_count')
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def problem_comments(request, problem_id):
    if request.method == 'GET':
        return Response({'comments': [], 'problem_id': problem_id})
    return Response({'message': 'Comment created (stub)', 'problem_id': problem_id}, status=201)


@api_view(['GET'])
def problem_hints(request, problem_id):
    try:
        task = Task.objects.get(id=problem_id)
        return Response({'hints': task.hints, 'problem_id': problem_id})
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_progress(request):
    total = Task.objects.count()
    solved = (
        Submission.objects.filter(user=request.user, is_correct=True)
        .values('task')
        .distinct()
        .count()
    )
    return Response({
        'total_tasks': total,
        'solved_tasks': solved,
        'progress_percent': round(solved / total * 100, 1) if total else 0,
    })
