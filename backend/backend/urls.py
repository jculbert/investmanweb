"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from rest_framework_nested import routers

from reports.views import DividendSummaryViewSet
from accounts.views import AccountViewSet
from holdings.views import HoldingsViewSet
from transactions.views import TransactionViewSet
from uploads.views import UploadViewSet

router = routers.SimpleRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'uploads', UploadViewSet)

urlpatterns = [
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/dividends/', DividendSummaryViewSet.as_view()),
    url(r'^api/v1/holdings/', HoldingsViewSet.as_view()),

    url(r'^admin/', admin.site.urls),
]
