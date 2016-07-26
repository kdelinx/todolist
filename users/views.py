import json

from django.contrib.auth import login
from django.http.response import JsonResponse as Response
from django.views.generic import CreateView

from core.utils import ErrorResponse
from users.models import User


class UserRegisterJSON(CreateView):
    model = User

    def post(self, request, *args, **kwargs):
        data = json.loads(self.request.body)
        email = data.get('email', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        password = data.get('password', '')
        user = self.model.objects.create_user(email, first_name,
                                              last_name, password)
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(self.request, user)
        return Response({'email': user.email, 'id': user.pk, 'status': True})


class UserLoginJSON(CreateView):
    model = User

    def post(self, request, *args, **kwargs):
        data = json.loads(self.request.body)
        email = data.get('email', '')
        password = data.get('password', '')
        if not self.model.objects.filter(email__icontains=email).exists():
            return ErrorResponse(code=403, msg=u'User doesn\'t exists')
        user = self.model.objects.get(email__icontains=email)
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        if user.check_password(password):
            login(self.request, user)
            return Response({'status': True, 'id': user.pk})
        else:
            return ErrorResponse(code=400, msg=u'Something wrong!')
