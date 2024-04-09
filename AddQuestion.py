phrase = input("Please enter the phrase you would like to add: ")
context = input("Please enter the clue for the phrase: ")
import json
with open('jumble.json', 'r') as f:
    data = json.load(f)
    data.append({"phrase": phrase, "context": context})
with open('jumble.json', 'w') as f:
    json.dump(data, f)
print("Phrase added successfully!")