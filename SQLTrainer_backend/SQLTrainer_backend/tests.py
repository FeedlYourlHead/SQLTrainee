from rest_framework.test import APITestCase
from rest_framework import status

class SomethingTests(APITestCase):

    def setUp(self):
        pass

    def test_get_product_list(self):
        response = self.client.get('/api/something/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
