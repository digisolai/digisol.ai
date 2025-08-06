from django.apps import AppConfig


class AccountsMinimalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    
    def ready(self):
        # Override the models module to use minimal models
        from . import models_minimal
        import sys
        sys.modules[f'{self.name}.models'] = models_minimal