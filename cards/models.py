# coding: utf-8
import uuid

from django.db import models
from core.models import AbstractBaseDatetime


class Cards(AbstractBaseDatetime):
    LINK, CARD, NOTE, NOTICE = 0, 1, 2, 3
    CARD_TYPE = (
        (LINK, u'Ссылка'),
        (CARD, u'Карточка'),
        (NOTE, u'Заметка'),
        (NOTICE, u'Уведомление')
    )

    title = models.CharField(
        max_length=80,
        verbose_name=u'заголовок'
    )
    description = models.TextField(
        verbose_name=u'содержимое'
    )
    type = models.PositiveSmallIntegerField(
        choices=CARD_TYPE,
        default=CARD
    )
    is_fav = models.BooleanField(
        default=False,
        verbose_name=u'избранная?'
    )
    ext_id = models.UUIDField(
        default=uuid.uuid4
    )
    user = models.ForeignKey(
        'users.User',
        related_name='cards_user',
        verbose_name=u'пользователь'
    )

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name = u'заметка'
        verbose_name_plural = u'заметки'
