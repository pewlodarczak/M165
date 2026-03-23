import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query


def main(context):
    # 1. Get environment variables directly from os.environ
    # In Appwrite functions, use os.environ or context.req.variables
    endpoint = os.environ.get('APPWRITE_FUNCTION_ENDPOINT') or os.environ.get('APPWRITE_ENDPOINT')
    project_id = os.environ.get('APPWRITE_FUNCTION_PROJECT_ID')
    api_key = os.environ.get('APPWRITE_API_KEY')

    # Check for missing variables
    if not endpoint or not project_id or not api_key:
        error_msg = f"Missing configuration: endpoint={bool(endpoint)}, project_id={bool(project_id)}, api_key={bool(api_key)}"
        context.log(error_msg)
        return context.res.json({"error": error_msg}, 500)

    try:
        # 2. Initialize Appwrite client
        client = Client()
        client.set_endpoint(endpoint)
        client.set_project(project_id)
        client.set_key(api_key)

        databases = Databases(client)

        # 3. Get pagination parameters from request
        # Access query params from context.req.query
        last_id = None
        limit = 6

        # Parse query parameters
        if hasattr(context.req, 'query') and context.req.query:
            last_id = context.req.query.get('last_id')
            try:
                limit = int(context.req.query.get('limit', 6))
            except (ValueError, TypeError):
                limit = 6

        # 4. Build queries
        queries = [Query.limit(limit)]
        if last_id:
            queries.append(Query.cursor_after(last_id))

        # 5. Query the database
        response = databases.list_documents(
            database_id="69bd233e001c84f461e7",
            collection_id="ferrari_images",  # Changed from table_id to collection_id
            queries=queries
        )

        # 6. Process the response
        documents = response['documents'] if isinstance(response, dict) else response.documents

        # Extract car data
        cars = []
        for doc in documents:
            if isinstance(doc, dict):
                cars.append(doc)
            elif hasattr(doc, '__dict__'):
                cars.append(doc.__dict__)
            else:
                cars.append(doc)

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

        context.log(f"Successfully fetched {len(cars)} cars")
        return context.res.json(result)

    except Exception as e:
        error_details = str(e)
        context.error(f"Execution Error: {error_details}")
        return context.res.json({
            "error": "Internal server error",
            "details": error_details
        }, 500)