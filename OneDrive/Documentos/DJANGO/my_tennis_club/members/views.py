from django.http import HttpResponse, Http404
from django.template import loader
from django.shortcuts import render
from .models import Member

def members(request):
  mymembers = Member.objects.all().values()
  template = loader.get_template('all_members.html')
  context = {
    'mymembers': mymembers,
  }
  return HttpResponse(template.render(context, request))
  
def details(request, id):
  try:
    mymember = Member.objects.get(id=id)
    template = loader.get_template('details.html')
    context = {
      'mymember': mymember,
    }
    return HttpResponse(template.render(context, request))
  except Member.DoesNotExist:
    template = loader.get_template('404.html')
    return HttpResponse(template.render({}, request), status=404)

def main(request):
  template = loader.get_template('main.html')
  return HttpResponse(template.render({}, request))

def myfirst(request):
  template = loader.get_template('myfirst.html')
  return HttpResponse(template.render({}, request))

def custom_404(request, exception=None):
  template = loader.get_template('404.html')
  return HttpResponse(template.render({}, request), status=404)