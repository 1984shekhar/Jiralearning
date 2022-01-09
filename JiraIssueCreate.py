import requests
import json
#https://realpython.com/api-integration-in-python/
headers = {'content-type': 'application/json'}
api_url = "http://localhost:8080/rest/api/2/issue/"
payload = '/home/cpandey/Development/pythonCode/data.txt'
with open(payload, "r") as jsonfile:
 json_object = json.load(jsonfile)
jsonfile.close()
print(json_object)
print(json_object["fields"]["summary"])
print(json_object["fields"]["description"])
issueNo = ""
for x in range(100):
    issueNo = str(x)
    json_object["fields"]["summary"] = "Issue - " + issueNo
    json_object["fields"]["description"] = "Created using REST with python. This is description - "+ issueNo  
    json_string = json.dumps(json_object)
    response = requests.post(api_url, auth=('cpandey', 'administrator'),data=json_string, headers=headers)
    print("response of request: " + issueNo + response.text)
print("Total issue created: "+issueNo);
#with open(payload) as payloadfile:
# response = requests.post(api_url, auth=('cpandey', 'administrator'),data=payloadfile, headers=headers)
#print(response)
#print(response.content)
#print(response.text)