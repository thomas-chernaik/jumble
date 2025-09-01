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
# calculte the date for the new phrase
# it is either tomorrow, or the day after the last phrase in the file, whichever is later
from datetime import datetime, timedelta
today = datetime.now()
if len(data) == 0:
    new_date = today + timedelta(days=1)
else:
    last_date_str = data[-1]['date']
    last_date = datetime.strptime(last_date_str, '%Y%m%d')
    new_date = max(today + timedelta(days=1), last_date + timedelta(days=1))
data.append({"phrase": phrase, "context": context, "date": new_date.strftime('%Y%m%d')})
with open('jumble.json', 'w') as f:
    json.dump(data, f, indent=2)
print("Phrase added successfully!")
# print the number of phrases in the file
print("Number of phrases in the file: ", len(data))