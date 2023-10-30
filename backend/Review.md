`backend/config/cook_me_gpt.conf`   
The configuration should be more generic and use somthink like $PWD or $HOME instead of the absolute path.   
`backend/config/gunicorn.conf.py`   
Probably  need to load the data frome environment or configuration instead of harcoded values.   
`backend/cook_me_gpt/settings.py`   
CSRF_TRUSTED_ORIGINS = ['https://64.227.125.101'] # This should be loaded from configuration 
Should use real MySql:
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
  
`backend/server/api/views.py`   
- The  RecipeViewSet  class is missing the required  queryset  attribute.    
- The  RecipeCreateViewSet  class is missing the required  queryset  attribute.    
- The  RecipeSaveViewSet  class is missing the required  queryset  attribute.    
`backend/gpt_test.py`   
model_id = 'gpt-3.5-turbo' and other ChatGpt related variables should be loaded from configuration.   
 
