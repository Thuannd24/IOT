import requests

url = "http://127.0.0.1:5000/reload_db"

response = requests.post(url)
print(response.status_code)
print(response.json())
