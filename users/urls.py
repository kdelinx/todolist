from django.conf.urls import url, include
from users.views import UserRegisterJSON, UserLoginJSON

urlpatterns = [
    url(
        r'^user/',
        include([
            url(
                r'^login/$',
                UserLoginJSON.as_view(),
                name='login_user_json'
            ),
            url(
                r'^register/$',
                UserRegisterJSON.as_view(),
                name='register_user_json'
            )
        ])
    )
]
