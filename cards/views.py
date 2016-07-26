import json

from django.http.response import JsonResponse as Response
from django.shortcuts import render
from django.views.generic import (
    ListView, DetailView, DeleteView, CreateView)

from cards.models import Cards
from core.utils import dt_to_unix, ErrorResponse


class CardListJSON(ListView):
    model = Cards

    def get_queryset(self):
        return self.model.objects.\
            filter(user=self.request.user).all()

    def get(self, request, *args, **kwargs):
        limit = self.request.GET.get('limit', 10)
        offset = self.request.GET.get('start', 0)
        ordering = self.request.GET.get('ordering', '-date_created')
        favorite = self.request.GET.get('fav', '')
        to_offset = int(limit) + int(offset)
        if favorite:
            data_qs = self.get_queryset().order_by(ordering).\
                filter(is_fav=True)[offset:to_offset]
        else:
            data_qs = self.get_queryset().order_by(ordering)[offset:to_offset]
        if 'filter' in self.request.body:
            data_json = json.loads(self.request.body)
            data_qs = self.get_queryset().order_by(ordering). \
                filter(title__icontains=data_json['title'])[offset:to_offset]
        data_output = {'cards': map(lambda x: {
            'id': x.pk, 'description': x.description, 'is_fav': x.is_fav,
            'ext_id': str(x.ext_id), 'date_created': dt_to_unix(x.date_created),
            'title': x.title
        }, data_qs)}
        data_output.update({'count': data_qs.count()})
        return Response(data_output)


class CardDetailJSON(DetailView):
    model = Cards

    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        card_id = kwargs['uuid']
        data_qs = self.get_queryset().filter(ext_id=card_id)
        if not data_qs.exists():
            return ErrorResponse(code=404, msg=u'Card not found')
        data_output = map(lambda x: {
            'id': x.pk, 'description': x.description, 'is_fav': x.is_fav,
            'ext_id': str(x.ext_id), 'date_created': dt_to_unix(x.date_created),
            'title': x.title
        }, data_qs).pop()
        return render(request, 'detail_note.html', {'note': data_output})


class CardEditJSON(CreateView):
    model = Cards

    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def post(self, request, *args, **kwargs):
        card_values = {}
        data = json.loads(self.request.body)
        data_qs = self.get_queryset().filter(ext_id=data['ext_id'])
        if not data_qs.exists():
            return ErrorResponse(code=404, msg=u'Card not found')
        for key, value in data.iteritems():
            if key != '' or value is not None:
                card_values[key] = value
            data_qs.update(**card_values)
        return Response({'status': True})


class CardCreateJSON(CreateView):
    model = Cards

    def post(self, request, *args, **kwargs):
        data = json.loads(self.request.body)
        user = self.request.user.pk
        title = data.get('title', '')
        desc = data.get('desc', '')
        type = data.get('type', '')
        data_qs = {'title': title, 'description': desc,
                   'user_id': user, 'type': type}
        card = self.model.objects.create(**data_qs)
        return Response({'id': card.pk})


class CardDeleteJSON(DeleteView):
    model = Cards

    def delete(self, request, *args, **kwargs):
        data = json.loads(self.request.body)
        card_pk = data['id']
        if not self.model.objects.filter(pk=card_pk).exists():
            return ErrorResponse(code=404, msg=u'Card doesn\'t exists!')
        self.model.objects.filter(pk=card_pk).delete()
        return Response({'status': True})
