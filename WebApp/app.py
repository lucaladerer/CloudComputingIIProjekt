import os
import logging
from flask import Flask, jsonify, render_template, request, g
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# log config
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# app config
app = Flask(__name__, template_folder="templates")


# get variables from environment variables and access the database
db_password = os.getenv("DB_PASSWORD")
if not db_password:
    logging.error("DB_PASSWORD not set!")
    raise ValueError("DB_PASSWORD not set!")

collection_name = os.getenv("COLLECTION")
if not collection_name:
    logging.error("COLLECTION not set!")
    raise ValueError("COLLECTION not set!")
app.config["COLLECTION_NAME"] = collection_name

counters = os.getenv("COUNTERS_COLLECTION")
if not counters:
    logging.error("COUNTERS_COLLECTION not set!")
    raise ValueError("COUNTERS_COLLECTION not set!")
app.config["COUNTERS_COLLECTION"] = counters



uri = f"mongodb+srv://lucaladerer:{db_password}@ccii.yu2co.mongodb.net/?retryWrites=true&w=majority&appName=CCII"
def get_db():
    '''Needed for running with uWSGI - create a connection to the database on demand'''
    if 'db' not in g:
        client = MongoClient(uri, server_api=ServerApi('1'))
        g.mongo_client = client
        g.db = client["CCII"]
    return g.db


@app.route('/')
def index():
    '''Landing page routing - main page'''
    logging.info("Rendered landing page")
    return render_template('index.html')


@app.route('/ranking')
def ranking():
    '''Ranking page routing'''
    logging.info("Rendered ranking page")
    return render_template('ranking.html')


@app.route('/readJokes', methods=['GET'])
def get_jokes():
    '''HTTP GET request to get all jokes from the database'''
    db = get_db()
    collection = db[app.config["COLLECTION_NAME"]]
    counters = app.config["COUNTERS_COLLECTION"]

    # Get all jokes and total ratings
    jokes = list(collection.find({}))
    totalRatings = list(db[counters].find())

    # iterate trhough all jokes
    for joke in jokes:
        joke["_id"] = str(joke["_id"])
    jokes.append(totalRatings)

    logging.debug(f"Found jokes: {jokes}")
    return jsonify(jokes)


@app.route('/addJoke', methods=['POST'])
def add_joke():
    '''HTTP POST request to add a new joke to the database'''
    db = get_db()
    collection = db[app.config["COLLECTION_NAME"]]
    counters = app.config["COUNTERS_COLLECTION"]

    data = request.json
    dataExtract = data['submitJoke']
    logging.debug(f"Submitted Joke: {dataExtract}")

    # Increase number of total ratings
    db[counters].update_one({'_id': 'totalRatings'}, {'$inc': {'count': 1}})

    # Insert joke into database
    result = collection.insert_one(dataExtract)

    # return feedback message
    return jsonify({
        "message": "Joke inserted successfully",
        "id": str(result.inserted_id)
    }), 201


if __name__ == '__main__':
    app.run(debug=True)