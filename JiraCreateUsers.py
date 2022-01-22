# This script shows how to get groups or applicationRoles assigned to users in Jira.

import getpass
from jira import JIRA
class CreateUsers:
  def __init__(self, serverUrl, username, password):
    self.serverUrl = serverUrl
    self.username = username
    self.password = password

  def createUser(self):
   jira = JIRA(server=self.serverUrl,basic_auth=(self.username, self.password))
   username=['test11','test22','test33','test44','test55']
   emails=['test1@test.com','test2@test.com','test3@test.com','test4@test.com','test5@test.com']
   passwords='administrator'
   for x in range(len(username)):
      print (username[x])
      jira.add_user(username[x],emails[x],passwords,'',False,True,False,'')

url = input("url address: ")
name = input("username: ")
password = getpass.getpass("password: ")

CreateUsers(url, name, password).createUser();