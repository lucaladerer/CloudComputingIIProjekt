from json import dumps
from flask import Flask, current_app, g, jsonify, render_template, request
from flask_pymongo import PyMongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)

uri = "mongodb+srv://lucaladerer:VfnMplqnE7iQJemc@ccii.yu2co.mongodb.net/?retryWrites=true&w=majority&appName=CCII"
#uri = "mongodb+srv://lucaladerer:<db_password>@ccii.yu2co.mongodb.net/?retryWrites=true&w=majority&appName=CCII"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["CCII"]
collection = db["Jokes"] 

# db = g._database = PyMongo(current_app).db

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ranking')
def ranking():
    return render_template('ranking.html')

@app.route('/readJokes', methods=['GET'])
def get_jokes():
    # jokes = list(db.jokes.find())  # Alle Einträge abrufen (ohne MongoDB-ID)
    jokes = list(collection.find({}))  # Alle Einträge abrufen (ohne MongoDB-ID)
    totalRatings = list(db["counters"].find())
    # print("Fetched jokes: " + str(jokes))
    for joke in jokes:
        joke["_id"] = str(joke["_id"])
    jokes.append(totalRatings)
    print(jokes)
    return jsonify(jokes)

@app.route('/addJoke', methods=['POST'])
def add_joke():
    data = request.json  # JSON-Daten aus der Anfrage
    dataExtract = data['submitJoke']
    print("Submitted Joke:")
    print(dataExtract)
    # if "text" not in dataExtract or "author" not in dataExtract:
    #     return jsonify({"error": "Bitte 'text' und 'author' angeben"}), 400

    # return db.jokes.insert_one(dataExtract)


    # if not db.counters.find_one({'_id': 'totalRatings'}):
    #     db.counters.insert_one({'_id': 'totalRatings', 'count': 21})
    # else:
    db["counters"].update_one({'_id': 'totalRatings'}, {'$inc': {'count': 1}})
    # db.counters.update_one({'_id': 'totalRatings'}, {'$inc': {'count': 1}})


    print("Added new joke: " + str(dataExtract))
    result = collection.insert_one(dataExtract)

    # Gebe eine Antwort mit der eingefügten ID zurück
    return jsonify({
        "message": "Joke inserted successfully",
        "id": str(result.inserted_id)  # Umwandlung der ObjectId in eine Zeichenkette
    }), 201
    # return collection.insert_one(dataExtract)

if __name__ == '__main__':
    app.run(debug=True)



##


# Create a new client and connect to the server

# Send a ping to confirm a successful connection
# try:
#     client.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print(e)

##