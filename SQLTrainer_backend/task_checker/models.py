from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Task(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    expected_query = models.TextField()
    schema_sql = models.TextField(help_text="SQL для создания начальной таблицы")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name='tasks'
    )
    difficulty = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,
related_name="attempts")
    task = models.ForeignKey(Task, on_delete=models.CASCADE,
related_name="submissions")
    user_query = models.TextField()
    is_correct = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.task}"
