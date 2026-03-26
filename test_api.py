import requests
import json

url = "http://127.0.0.1:8000/api/generate-quiz/"
payload = {"topic": "Space Exploration"}

print("Sending request to AI... (this takes ~5-10 seconds)")

try:
    response = requests.post(url, json=payload)
    
    if response.status_code == 201:
        print("\n✅ SUCCESS! AI Generated this quiz:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\n❌ Error {response.status_code}:")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Connection Failed: {e}")