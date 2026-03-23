import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query


def main(context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    # Handle preflight OPTIONS request
    if context.req.method == 'OPTIONS':
        return context.res.json({}, 204, headers)

    # Get environment variables
    endpoint = os.environ.get('APPWRITE_FUNCTION_ENDPOINT') or os.environ.get('APPWRITE_ENDPOINT')
    project_id = os.environ.get('APPWRITE_FUNCTION_PROJECT_ID')
    api_key = os.environ.get('APPWRITE_API_KEY')

    if not endpoint or not project_id or not api_key:
        error_msg = f"Missing configuration"
        context.log(error_msg)
        return context.res.json({"error": error_msg}, 500, headers)

    try:
        client = Client()
        client.set_endpoint(endpoint)
        client.set_project(project_id)
        client.set_key(api_key)

        databases = Databases(client)

        # Get pagination parameters
        last_id = None
        limit = 6

        if hasattr(context.req, 'query') and context.req.query:
            last_id = context.req.query.get('last_id')
            try:
                limit = int(context.req.query.get('limit', 6))
            except (ValueError, TypeError):
                limit = 6

        # Build queries
        queries = [Query.limit(limit)]
        if last_id:
            queries.append(Query.cursor_after(last_id))

        # Query the database
        response = databases.list_documents(
            database_id="69bd233e001c84f461e7",
            collection_id="ferrari_images",
            queries=queries
        )

        # Extract documents - handle both dict and object responses
        if isinstance(response, dict):
            documents = response.get('documents', [])
        else:
            documents = response.documents if hasattr(response, 'documents') else []

        context.log(f"Number of documents found: {len(documents)}")

        # Extract car data properly
        cars = []
        for idx, doc in enumerate(documents):
            # Convert to dict if it's not already
            if not isinstance(doc, dict):
                # Try to get data attribute or convert to dict
                if hasattr(doc, 'data'):
                    doc = doc.data
                elif hasattr(doc, '__dict__'):
                    doc = doc.__dict__
                else:
                    doc = {}

            # Log the document structure for debugging
            context.log(f"Document {idx} keys: {doc.keys()}")

            # Extract the actual car data
            car_data = {
                'id': doc.get('$id', ''),
                'brand': doc.get('brand', ''),
                'model': doc.get('model', ''),
                'title': doc.get('title', ''),
                'image_url': doc.get('image_url', ''),
                'resolution': doc.get('resolution', ''),
                'file_id': doc.get('file_id', '')
            }

            cars.append(car_data)
            context.log(
                f"Car {idx}: {car_data['brand']} {car_data['model']} - {car_data['image_url'][:50] if car_data['image_url'] else 'No URL'}")

        # Get last ID for pagination
        last_document_id = None
        if documents:
            last_doc = documents[-1]
            if isinstance(last_doc, dict):
                last_document_id = last_doc.get('$id')
            elif hasattr(last_doc, '$id'):
                last_document_id = last_doc['$id']

        result = {
            "cars": cars,
            "lastId": last_document_id,
            "hasMore": len(documents) == limit
        }

        context.log(f"Returning {len(cars)} cars")
        return context.res.json(result, 200, headers)

    except Exception as e:
        error_details = str(e)
        context.error(f"Execution Error: {error_details}")
        return context.res.json({
            "error": "Internal server error",
            "details": error_details
        }, 500, headers)