from rest_framework import pagination
from rest_framework.response import Response


class MyPagination(pagination.PageNumberPagination):
    page_size_query_param = 'limit'

    def get_paginated_response(self, data):
        if 'limit' not in self.request.query_params:
            return Response(
                data
            )
        else:
            return Response({
                'count': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'results': data
            })
