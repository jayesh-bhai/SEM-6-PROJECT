import requests

url = "http://localhost:5000/predict"

data = {"url": "http://www.crestonwood.com/router.php/?id=1"}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
