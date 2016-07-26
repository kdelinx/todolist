import os
from todolist.settings_local import *
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_KEY = '(^hyx)qmcb6tdxm%jn+w@e&pq!zn=%uvcvmz_7&azs7%$1_*_r'
ALLOWED_HOSTS = ['*']
AUTH_USER_MODEL = 'users.User'
INSTALLED_APPS = (
    # Django applications
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Own applications
    'users',
    'core',
    'cards',
)
MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)
ROOT_URLCONF = 'todolist.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'todolist.wsgi.application'
LANGUAGE_CODE = 'ru-RU'
TIME_ZONE = 'Asia/Novosibirsk'
USE_I18N = False
USE_L10N = False
USE_TZ = False
STATIC_URL = '/assets/'
STATIC_ROOT = os.path.join(BASE_DIR, 'assets')
MEDIA_URL = '/files/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'files')
