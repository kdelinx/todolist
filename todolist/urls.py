from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
    url(
        r'^$',
        'core.views.core_index',
        name='index'
    ),
    url(
        r'^admin/',
        include(admin.site.urls)
    ),
    url(
        r'^users/',
        include('users.urls', namespace='users'),
    ),
    url(
        r'^note/',
        include('cards.urls', namespace='cards')
    )
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
