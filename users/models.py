# coding: utf-8
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from users.managers import UserManager
from django.db import models


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        max_length=255,
        unique=True,
        verbose_name=u'Email'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='активный?'
    )
    first_name = models.CharField(
        max_length=80,
        verbose_name='фамилия'
    )
    last_name = models.CharField(
        max_length=80,
        verbose_name=u'имя'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    @property
    def is_staff(self):
        return self.is_superuser

    def __unicode__(self):
        return self.email

    def get_full_name(self):
        return u'%s %s' % (self.first_name, self.last_name)

    def get_short_name(self):
        return u'%s %s.' % (self.first_name, self.last_name[0])

    def has_module_perms(self, app_label):
        return True

    def has_perms(self, perm_list, obj=None):
        return True

    def has_perm(self, perm, obj=None):
        return True

    class Meta:
        verbose_name = u'пользователь'
        verbose_name_plural = u'пользователи'