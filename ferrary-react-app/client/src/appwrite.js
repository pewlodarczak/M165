import { Client, Databases, Storage, Functions, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69bd1215001bd5ad8496');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const account = new Account(client);

export default client;