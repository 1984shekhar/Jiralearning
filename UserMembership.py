# This script shows how to use the client in anonymous mode
# against jira.atlassian.com.
import getpass
from jira import JIRA
class UserMembership:
  def __init__(self, serverUrl, username, password):
    self.serverUrl = serverUrl
    self.username = username
    self.password = password

  def getUserGroups(self):
   jira = JIRA(server=self.serverUrl,basic_auth=(self.username, self.password))
   users = jira.search_users(".")
   for user in users:
    jirauser = jira.user(user.name,expand="groups,applicationRoles")
    # print(jirauser.name,jirauser.groups,jirauser.applicationRoles)
    groups = jirauser.groups
    groupSize = jirauser.groups.size
    group_list = list()
    for x in range(groupSize):
       group_list.append(groups.items[x].name)
    user_all_group = ",".join(group_list)

    appRole = jirauser.applicationRoles
    appRoleSize = jirauser.applicationRoles.size
    appRole_list = list()
    for x in range(appRoleSize):
       appRole_list.append(appRole.items[x].name)
    user_all_appRole = ",".join(group_list)

    print("user: "+jirauser.name +"; groups:" + user_all_group +"; applicationRoles: " + user_all_appRole)
   
url = input("url address: ")
name = input("username: ")
password = getpass.getpass("password: ")

UserMembership(url, name, password).getUserGroups();

