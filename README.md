For this Task 9.1P, I still used the same codes from 6.1P.
Firstly, I connected this application to MongoDB by adding the MongoDB connection string and using the official MongoDB Node.js driver. 
Then, I updated the related routes to perform real CRUD operations with the database instead of just in-memory storage.

After that, I tested all the API operations including create, read, update, and delete (CRUD) and they all worked successfully. 
The data sent through the API is now stored in the MongoDB database, and I can view the data history directly through the MongoDB web interface.

If you want to use this application, please run npm install first. 
When the console shows that the MongoDB connection is successful, that means the app is working correctly with the database. 
Then, any new data from the API will then be saved and can be viewed in MongoDB.
