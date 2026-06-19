from django.contrib import admin
from .models import Article, UploadedImage

admin.site.register(Article)
admin.site.register(UploadedImage)
