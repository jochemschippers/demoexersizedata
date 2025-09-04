Why and How We Built This Application
This application's core functionality is built on AI-powered semantic search, a more advanced method than traditional keyword search. This approach allows the system to understand the meaning and context of a workout description, not just the words it contains.

The "What" and "Why"
What we used: We leveraged two distinct types of AI models:

A transformer-based embedding model to handle the core semantic search.

A language model for content validation.

Why this method: Our goal was to create a robust system that can identify similar concepts even with different phrasing or typos. This approach is superior to keyword search because it captures the true intent behind the data. A search for a "full body workout" will successfully match "a comprehensive routine targeting all major muscle groups," which a simple text search might miss.

The "How"
AI Embeddings: When a new workout is created, its details are sent to Google's embedding-001 model. This model returns a 768-dimensional vector—a list of numbers that represents the workout's meaning. This vector is stored in our MongoDB database.

Vector Search: To check for duplicates, the new workout's vector is compared to all existing vectors in the database using MongoDB Atlas's $vectorSearch. This process efficiently finds the nearest vector by calculating the similarity between them.

Data Quality: A separate AI layer validates the spelling and grammar of the workout description. This ensures that the data used to create the embeddings is clean and accurate, improving the reliability of the entire system.