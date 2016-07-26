from django.shortcuts import render


def core_index(request):
    return render(request, 'base.html')
