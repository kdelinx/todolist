from django.conf.urls import url, include
from cards.views import CardListJSON, CardDetailJSON, CardDeleteJSON, \
    CardCreateJSON, CardEditJSON

urlpatterns = [
    url(
        r'^(?P<uuid>[\w\-]+)/$',
        CardDetailJSON.as_view(),
        name='card_detail_json'
    ),
    url(
        r'^card/',
        include([
            url(
                r'^list/$',
                CardListJSON.as_view(),
                name='card_list_json'
            ),
            url(
                r'^delete/$',
                CardDeleteJSON.as_view(),
                name='card_delete_json'
            ),
            url(
                r'^edit/$',
                CardEditJSON.as_view(),
                name='card_edit_json'
            ),
            url(
                r'^create/$',
                CardCreateJSON.as_view(),
                name='card_create_json'
            )
        ])
    )
]
