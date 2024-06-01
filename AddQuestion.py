phrase = input("Please enter the phrase you would like to add: ")
import json
with open('jumble.json', 'r') as f:
    data = json.load(f)
# create a set of lower case phrases
phrases = set()
for item in data:
    phrases.add(item["phrase"].lower())
if phrase.lower() in phrases:
    print("Phrase already exists!")
    exit()
#check phrase only contains letters and spaces
for c in phrase:
    if not c.isalpha() and c != " ":
        print("Phrase should only contain letters and spaces!")
        exit()
context = input("Please enter the clue for the phrase: ")
data.append({"phrase": phrase, "context": context})
with open('jumble.json', 'w') as f:
    json.dump(data, f)
print("Phrase added successfully!")
# print the number of phrases in the file
print("Number of phrases in the file: ", len(data))