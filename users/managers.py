# coding: utf-8
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):

    def create_user(self, email, first_name, last_name, password=None):
        if not email:
            raise ValueError(u'User must  have an email address')

        data = {
            'email': email.lower(),
            'first_name': first_name.capitalize(),
            'last_name': last_name.capitalize(),
        }
        user = self.model(**data)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password):
        user = self.create_user(email, first_name, last_name, password)
        user.is_superuser = True
        user.is_admin = True
        user.save(using=self._db)
        return user
