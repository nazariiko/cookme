# Use python:3.11-alpine as a base image
FROM python:3.11-alpine AS base
WORKDIR /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt --no-cache-dir
COPY . /app

# Create builder image
FROM base AS runner

EXPOSE 8000
ENTRYPOINT ["python3"]
CMD ["manage.py", "runserver", "0.0.0.0:8000"]