
package com.example.plugins.myjiraplugin;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.IssueManager;
import com.atlassian.jira.issue.fields.CustomField;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import java.io.IOException;

public class HelloWorldServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");

        // Get issue key and custom field ID from request parameters
       // String issueKey = request.getParameter("issueKey");
        String issueKey = "TP-8";
        //String customFieldId = request.getParameter("customFieldId");
        String customFieldId = "customfield_10300";
        if (issueKey == null || customFieldId == null) {
            response.getWriter().write("<h1>Missing issue key or custom field ID</h1>");
            return;
        }

        // Retrieve the custom field value
        String customFieldValue = getCustomFieldValue(issueKey, customFieldId);

        // Write the response
        response.getWriter().write("<h1>Custom Field Value</h1>");
        response.getWriter().write("<p>Issue Key: " + issueKey + "</p>");
        response.getWriter().write("<p>Custom Field ID: " + customFieldId + "</p>");
        response.getWriter().write("<p>Custom Field Value: " + customFieldValue + "</p>");
    }

    private String getCustomFieldValue(String issueKey, String customFieldId) {
        IssueManager issueManager = ComponentAccessor.getIssueManager();
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        Issue issue = issueManager.getIssueByCurrentKey(issueKey);
        if (issue == null) {
            return "Issue not found";
        }

        // Directly access the custom field using the ID without explicitly using CustomFieldManager
        CustomField customField = ComponentAccessor.getCustomFieldManager().getCustomFieldObject(customFieldId);
        if (customField == null) {
            return "Custom field not found";
        }

        Object value = issue.getCustomFieldValue(customField);
        return value != null ? value.toString() : "No value for custom field";
    }
}
