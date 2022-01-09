import requests
#https://realpython.com/api-integration-in-python/
api_url = "https://jsonplaceholder.typicode.com/todos/1"
response = requests.get(api_url)
print(response)
print(response.content)
print(response.text)
