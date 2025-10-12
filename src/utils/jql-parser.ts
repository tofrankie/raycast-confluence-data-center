import type { JQLQuery } from "@/types";

export function parseJQL(query: string): JQLQuery {
  if (!query || query.trim().length < 2) {
    return {
      raw: query,
      isJQL: false,
    };
  }

  const trimmedQuery = query.trim();

  const isJQL = isJQLSyntax(trimmedQuery);

  if (!isJQL) {
    return {
      raw: query,
      isJQL: false,
    };
  }

  const parsed = extractJQLElements(query);

  return {
    raw: query,
    isJQL: true,
    parsed,
  };
}

function extractJQLElements(query: string) {
  const fields: string[] = [];
  const operators: string[] = [];
  const values: string[] = [];

  // More precise field-operator-value matching pattern
  // Supports quoted field names, various operators, complex values (including function calls, lists, etc.)
  const fieldPattern =
    /(?:^|\s)(?:"[^"]+"|\w+(?:\.\w+)*)\s*([=!~<>]+|in|not\s+in|is|is\s+not|was|was\s+not|was\s+in|was\s+not\s+in|changed)\s*([^AND|OR|NOT|ORDER\s+BY]+?)(?=\s+(?:AND|OR|NOT|ORDER\s+BY|$))/gi;
  let match;

  while ((match = fieldPattern.exec(query)) !== null) {
    const fullMatch = match[0];
    const operator = match[1].trim();

    // Extract field name (remove leading spaces)
    const fieldMatch = fullMatch.match(/^(\s*)(?:"([^"]+)"|(\w+(?:\.\w+)*))/);
    const fieldName = fieldMatch ? fieldMatch[2] || fieldMatch[3] : "";

    // Extract value (remove operator part)
    const valueStart = fullMatch.indexOf(operator) + operator.length;
    const value = fullMatch.substring(valueStart).trim();

    if (fieldName && operator && value) {
      fields.push(fieldName);
      operators.push(operator);
      values.push(value);
    }
  }

  return {
    fields,
    operators,
    values,
  };
}

export function validateJQL(query: string): { isValid: boolean; error?: string } {
  if (!isJQLSyntax(query)) {
    return { isValid: true };
  }

  try {
    // Check parentheses matching
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      return { isValid: false, error: "Unmatched parentheses" };
    }

    // Check quote matching
    const singleQuotes = (query.match(/'/g) || []).length;
    const doubleQuotes = (query.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      return { isValid: false, error: "Unmatched single quotes" };
    }

    if (doubleQuotes % 2 !== 0) {
      return { isValid: false, error: "Unmatched double quotes" };
    }

    // Check logical operator usage
    const logicalOps = query.match(/\b(AND|OR|NOT)\b/g);
    if (logicalOps) {
      const conditions = query.split(/\b(AND|OR|NOT)\b/);
      if (conditions.length < 3) {
        return { isValid: false, error: "Invalid logical operator usage" };
      }
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "JQL syntax error" };
  }
}

export function isJQLSyntax(query: string) {
  if (!query || query.trim().length < 2) {
    return false;
  }

  const trimmedQuery = query.trim();

  const jqlPatterns = [
    // Basic field operator patterns
    /^\s*(?:"[^"]+"|\w+(?:\.\w+)*)\s*[=!~<>]/,
    // Compound operator patterns
    /^\s*(?:"[^"]+"|\w+(?:\.\w+)*)\s+(?:in|not\s+in|is|is\s+not|was|was\s+not|was\s+in|was\s+not\s+in|changed)\s+/,
    // Logical operators
    /\b(AND|OR|NOT)\b/,
    // Function calls - time-related, personnel-related, and issue-related functions
    /(?:startOfDay|startOfWeek|startOfMonth|startOfYear|endOfDay|endOfWeek|endOfMonth|endOfYear|lastLogin|now|currentLogin|currentUser|membersOf|issueHistory|openSprints|watchedIssues|myApproval|myPending|closedSprints|futureSprints|releasedVersions|unreleasedVersions|earliestUnreleasedVersion|latestReleasedVersion|votedIssues|projectsLeadByUser|componentsLeadByUser|projectsWhereUserHasPermission|projectsWhereUserHasRole|standardIssueTypes|subTaskIssueTypes|globalAccounts|internalIssues|structure|team|teamProjects|tempoEpicIssues|updatedBy|linkedIssues|parentIssuesOf|childIssuesOf|allDependencies|hardDependencies|softDependencies|inwardDependencies|outwardDependencies|issuesInPlan|issuesInProgram|issuesWithRemoteLinksByGlobalId|box|boxBacklog|boxLead|boxTasksOnCriticalPath|allBoxDescendantTasks|allBoxParentTasks|taskColor|accountsByCategory|accountsByCategoryType|accountsByCustomer|accountsByProject|accountsByStatus|getAutomatedTestCases|getAutomatedTestRuns|getAutomatedTestScenarios|getDefectsLinkedWithExecution|getIssuesLinkedWithTestRunsLike|getStoriesHavingDefectsLike|getStoriesLinkedWithTestCasesLike|getStoriesLinkedWithTestScenariosLike|getTestCasesByAssignTo|getTestCasesExecutedBy|getTestCasesHavingDefectsLike|getTestCasesHavingExecutionResultLike|getTestCasesHavingSteps|getTestCasesLinkedWithFolder|getTestCasesLinkedWithScenariosLike|getTestCasesLinkedWithStoriesLike|getTestRunsHavingDefectsLike|getTestRunsHavingPlatformsLike|getTestRunsLinkedWithScenariosLike|getTestRunsLinkedWithStoriesLike|getTestRunsLinkedWithTestCasesLike|getTestRunsUpdatedAfter|getTestScenariosHavingDefectsLike|getTestScenariosLinkedWithStoriesLike|getTestScenariosLinkedWithTestCasesLike|programProjects|programTeams|cascadeOption)\([^)]*\)/,
    // ORDER BY clause
    /ORDER\s+BY\s+(?:"[^"]+"|\w+(?:\.\w+)*)/i,
    // Built-in field patterns - based on actual Jira fields
    /(?:project|status|assignee|reporter|issuetype|priority|resolution|created|updated|summary|description|text|key|id|issue|issuekey|createdDate|updatedDate|resolutiondate|duedate|resolved|timeestimate|timeoriginalestimate|timespent|votes|watchers|comment|worklogComment|worklogDate|worklogAuthor|voter|watcher|parent|subtasks|attachments|environment|labels|level|category|filter|request|savedfilter|searchrequest|issueLinkType|issue\.property|originalEstimate|remainingEstimate|workratio|progress|lastViewed|fixVersion|affectedVersion|creator|type|issuetype|statusCategory)\s*[=!~<>]/i,
    // Custom field patterns (cf[number])
    /cf\[\d+\]\s*[=!~<>]/,
    // Quoted field patterns
    /"[^"]+"\s*[=!~<>]/,
  ];

  return jqlPatterns.some((pattern) => pattern.test(trimmedQuery));
}
