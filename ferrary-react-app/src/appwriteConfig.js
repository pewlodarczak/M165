import { Client, Databases, Query } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69bd1215001bd5ad8496');

const databases = new Databases(client);

export { client, databases, Query };