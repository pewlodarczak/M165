import { databases, Query } from './appwriteConfig';

const DATABASE_ID = '69bd233e001c84f461e7';
const COLLECTION_ID = 'ferrari_images';

const fetchCars = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(6)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
};