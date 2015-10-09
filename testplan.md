# Test Attack Plan

Community Casts has **0** test. Time to change that.

### **GET** `/api/tags/`

#### Integration Tests:

- A maximum of 20 tags are returned
- Tags should be ordered from most popular to least popular

### **POST** `/api/screencats`

- Request body has to be a correct Json model
- URL must be a valid YouTube video URL
- Tags must be a string
- Tags cannot be empty (user must submit at least one tag)
- User cannot submit more than 5 tags
- Duplicate tags are not stored in db
- Empty tags are not stored in the db
- Trailing whitespace on tags should be stripped
- If screencast already exists in the db return 404
- Information about the screencast such as title and channel should be
    stored in the database.
- It should not matter if the channel already exists in the db.
- It should not matter if the tag has been used before.
- A mapping should be created.
- Success returns 201
- Channel entity is created

### **GET** `/api/screencats/:screencastId`

Integration:

- If screencast ID does not exist, return 404.
- If screencast does exist redirect to screencast.
- If users view has already been counted, do not count again.
- If the user has not voted increment view by 1
- If the user has not voted store their IP in the table

