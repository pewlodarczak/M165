import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query


def main(context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if context.req.method == 'OPTIONS':
        return context.res.json({}, 204, headers)

    endpoint = os.environ.get('APPWRITE_FUNCTION_ENDPOINT') or os.environ.get('APPWRITE_ENDPOINT')
    project_id = os.environ.get('APPWRITE_FUNCTION_PROJECT_ID')
    api_key = os.environ.get('APPWRITE_API_KEY')

    try:
        client = Client()
        client.set_endpoint(endpoint).set_project(project_id).set_key(api_key)
        databases = Databases(client)

        # 1. Höheres Standard-Limit (Appwrite erlaubt bis zu 100 pro Request)
        limit = 25
        last_id = None

        # Parameter aus dem Request extrahieren
        if context.req.query:
            last_id = context.req.query.get('last_id')
            # Erlaube dem Frontend, das Limit selbst zu bestimmen
            limit = int(context.req.query.get('limit', 25))

        # 2. Queries aufbauen
        queries = [Query.limit(limit), Query.order_desc('$createdAt')]  # Neueste zuerst
        if last_id:
            queries.append(Query.cursor_after(last_id))

        response = databases.list_documents(
            database_id="69bd233e001c84f461e7",
            collection_id="ferrari_images",
            queries=queries
        )

        documents = response.get('documents', []) if isinstance(response, dict) else getattr(response, 'documents', [])

        cars = []
        for doc in documents:
            # Falls doc ein Objekt ist, in dict umwandeln
            d = doc if isinstance(doc, dict) else getattr(doc, 'data', getattr(doc, '__dict__', {}))

            cars.append({
                'id': d.get('$id') or d.get('id'),
                'brand': d.get('brand', 'Ferrari'),
                'model': d.get('model', 'Unknown'),
                'title': d.get('title', ''),
                'image_url': d.get('image_url', ''),
                'year': d.get('year', '2024')
            })

        # 3. Pagination-Logik für "Load More" im React-Frontend
        last_document_id = cars[-1]['id'] if cars else None

        return context.res.json({
            "cars": cars,
            "lastId": last_document_id,
            "total": response.get('total', 0) if isinstance(response, dict) else getattr(response, 'total', 0),
            "hasMore": len(cars) == limit
        }, 200, headers)

    except Exception as e:
        context.error(f"Error: {str(e)}")
        return context.res.json({"error": str(e)}, 500, headers)