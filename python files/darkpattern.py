
import spacy
nlp = spacy.load("en_core_web_md")

import pandas as pd
import numpy as np
df = pd.read_csv("exCSV.csv")

print(df.columns)


def preprocess_text(text):
    doc = nlp(text)
    pos_tags = ["VERB", "ADV"]  # Only include verbs and adverbs
    #add exclamation and only incude adverb and 
    filtered_tokens = [token for token in doc if token.pos_ in pos_tags or token.lower_ in ["yes", "no", "not"]]
    if filtered_tokens:
        return sum([token.vector for token in filtered_tokens]) / len(filtered_tokens)
    else:
        return None



training_examples = []
for i, row in df.iterrows():
    label1 = row["label1"]
    label2 = row["label2"]
    text1 = preprocess_text(label1)
    if text1 is not None and any(text1):
        training_examples.append((text1, 0)) # Assign 0 as the label for label1
    text2 = preprocess_text(label2)
    if text2 is not None and any(text2):
        training_examples.append((text2, 1)) # Assign 1 as the label for label2

from sklearn.model_selection import train_test_split

X = [example[0] for example in training_examples]
y = [example[1] for example in training_examples]

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

X_train = np.array(X_train)
y_train = np.array(y_train)

X_val = np.array(X_val)
y_val = np.array(y_val)

from keras.models import Sequential
from keras.layers import Dense

model = Sequential()
model.add(Dense(64, activation="relu", input_dim=300))
model.add(Dense(2, activation="softmax"))

model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_val, y_val))

loss, accuracy = model.evaluate(X_val, y_val)
print(f"Validation accuracy: {accuracy}")

new_examples = ["I agree", "No I do not"]
new_X = [preprocess_text(text) for text in new_examples]
new_X = np.array(new_X)

predictions = model.predict(new_X)
predictions

import matplotlib.pyplot as plt

y_pred = model.predict(X_val)
y_pred_proba = y_pred[:, 1]  # Extract the predicted probability for label2

plt.hist(y_pred_proba, bins=20)
plt.title("Distribution of predicted probabilities for label2")
plt.show()

model.save("my_model.h5")

import os
print(os.getcwd())



tfjs.converters.save_keras_model(model, tfjs_target_dir)

