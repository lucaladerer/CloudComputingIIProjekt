from json import dumps
import os
from flask import Flask, jsonify, render_template, request
# from flask_pymongo import PyMongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)

# get variables from environment variables and access the database
db_password = os.getenv("DB_PASSWORD")
if not db_password:
    raise ValueError("DB_PASSWORD ist nicht gesetzt!")

uri = f"mongodb+srv://lucaladerer:{db_password}@ccii.yu2co.mongodb.net/?retryWrites=true&w=majority&appName=CCII"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["CCII"]

collection_name = os.getenv("COLLECTION")
if not collection_name:
    raise ValueError("COLLECTION ist nicht gesetzt!")

collection = db[collection_name] 
counters = os.getenv("COUNTERS_COLLECTION")


# landing page route - main page
@app.route('/')
def index():
    return render_template('index.html')

# ranking page route
@app.route('/ranking')
def ranking():
    return render_template('ranking.html')

# HTTP GET call to display every joke in the database
@app.route('/readJokes', methods=['GET'])
def get_jokes():
    # get every joke and add the ratings
    jokes = list(collection.find({}))
    totalRatings = list(db[counters].find())
    for joke in jokes:
        joke["_id"] = str(joke["_id"])
    jokes.append(totalRatings)
    print(jokes)
    return jsonify(jokes)

# HTTP POST call to insert the joke rating into the database
@app.route('/addJoke', methods=['POST'])
def add_joke():
    data = request.json
    dataExtract = data['submitJoke']
    print("Submitted Joke:")
    print(dataExtract)
    
    # increase the counter to display the total amount of ratings
    db[counters].update_one({'_id': 'totalRatings'}, {'$inc': {'count': 1}})

    # server sided confirmation print
    print("Added new joke: " + str(dataExtract))
    result = collection.insert_one(dataExtract)

    return jsonify({
        "message": "Joke inserted successfully",
        "id": str(result.inserted_id)
    }), 201


if __name__ == '__main__':
    app.run(debug=True)