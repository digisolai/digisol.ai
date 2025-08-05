from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def template_list(request):
    """Placeholder view for template list"""
    return JsonResponse({
        'message': 'Template list endpoint - functionality not yet implemented',
        'status': 'placeholder'
    })

def template_detail(request, template_id):
    """Placeholder view for template detail"""
    return JsonResponse({
        'message': f'Template detail endpoint for ID {template_id} - functionality not yet implemented',
        'template_id': template_id,
        'status': 'placeholder'
    })
