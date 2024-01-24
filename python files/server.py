#import tensorflow as tf
from flask import Flask, jsonify, request
from keras.models import load_model
from flask_cors import CORS

import spacy
nlp = spacy.load("en_core_web_md")

import numpy as np


app = Flask(__name__)
CORS(app)



# Load the trained model
model = load_model("my_model.h5")
print("model loaded")




# Define a function to preprocess the input text
def preprocess_text(text):
    doc = nlp(text)
    pos_tags = ["VERB", "ADV"]  # Only include verbs and adverbs
    #add exclamation and only incude adverb and 
    filtered_tokens = [token for token in doc if token.pos_ in pos_tags or token.lower_ in ["yes", "no", "not"]]
    if filtered_tokens:
        return sum([token.vector for token in filtered_tokens]) / len(filtered_tokens)
    else:
        return None

# new_examples = ["slay uhh", "No uhhh"]
# new_X = [preprocess_text(text) for text in new_examples]
# new_X = np.array(new_X)

# print(model.predict(new_X))

#@app.route("/")
#def home():
#    return render_template("test2.html")

# Define a route to handle prediction requests
@app.route("/predict", methods=["POST"])
def predict():
    # Get the input data from the request
    data = request.get_json()
    request_list = [str(data["text"])] #returns a list of strings
    print(request_list)

    # Preprocess the input data
    X = [preprocess_text(t) for t in request_list]
    X = np.array(X)
    

    # Make a prediction using the trained model
    #only taking the first element of the prediction
    #prediction is of the form [ [9.9988, 2.223], [5.755, 4.332], .....]
    prediction = model.predict(X)[0]
    print(prediction)
    print(prediction[0])
    print(prediction[1])
    print(prediction[0]>0.9)

    # Convert the prediction to a label
    if (prediction[0] > 0.9):
        label = "label1"
    elif (prediction[1] > 0.8):
        label = "label2"
    else:
        label = "none"

    # Return the predicted label as JSON
    return jsonify({"label": label})
    #return jsonify({"label": text})
    #return render_template("test2.html")

if __name__ == "__main__":
#    app.run(host='0.0.0.0', port=8080)
#    app.run()
    app.run(debug=False, host='0.0.0.0')
