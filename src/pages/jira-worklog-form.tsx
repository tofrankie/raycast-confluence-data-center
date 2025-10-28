import { useEffect, useMemo } from "react";
import { Form, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { showFailureToast, useForm, FormValidation } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import {
  useJiraCurrentUser,
  useJiraIssueQuery,
  useJiraWorklogQuery,
  useJiraWorklogCreateMutation,
  useJiraWorklogUpdateMutation,
} from "@/hooks";
import type { JiraWorklogFormData, JiraWorklogCreateParams, JiraWorklogUpdateParams } from "@/types";

interface JiraWorklogProps {
  issueKey: string;
  worklogId?: number;
  onUpdate?: () => void;
}

const INITIAL_VALUES: JiraWorklogFormData = {
  date: new Date(),
  timeSpent: "",
  comment: "",
  remainingEstimate: "",
};

// Validate time format (e.g. "2h", "30m", "2h 30m")
const TIME_REGEX = /^(\d+(?:\.\d+)?)\s*[hm](\s+(\d+(?:\.\d+)?)\s*[hm])?$/i;

export function JiraWorklogProvider(props: JiraWorklogProps) {
  return (
    <QueryProvider>
      <JiraWorklogForm {...props} />
    </QueryProvider>
  );
}

function JiraWorklogForm({ issueKey, worklogId, onUpdate }: JiraWorklogProps) {
  const { pop } = useNavigation();
  const { currentUser } = useJiraCurrentUser();

  const { data: issue, isLoading: isIssueLoading, error: issueError } = useJiraIssueQuery(issueKey);

  const {
    data: worklog,
    isLoading: isWorklogLoading,
    error: worklogError,
  } = useJiraWorklogQuery(worklogId || 0, { enabled: !!worklogId });

  const { handleSubmit, itemProps, setValue } = useForm<JiraWorklogFormData>({
    initialValues: INITIAL_VALUES,
    validation: {
      date: FormValidation.Required,
      timeSpent: (value) => {
        console.log("🚀 ~ JiraWorklogForm ~ value:", value);
        const trimmedValue = value?.trim();
        if (!trimmedValue) {
          return "The item is required";
        }
        if (!TIME_REGEX.test(trimmedValue)) {
          return "Invalid time format. Use formats like '2h', '30m', or '2h 30m'";
        }
      },
      remainingEstimate: (value) => {
        if (value && value.trim().length > 0) {
          if (!TIME_REGEX.test(value.trim())) {
            return "Invalid time format. Use formats like '2h', '30m', or '2h 30m'";
          }
        }
      },
    },
    onSubmit: async (values) => {
      console.log("🚀 ~ JiraWorklogForm ~ values:", values);
      if (!currentUser) {
        showToast({
          style: Toast.Style.Failure,
          title: "User Not Found",
          message: "Current user information is not available",
        });
        return;
      }
      try {
        const timeSpentSeconds = parseTimeToSeconds(values.timeSpent);
        const startedDate = values.date?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
        if (worklogId) {
          // Update existing worklog
          const updateParams: JiraWorklogUpdateParams = {
            originId: worklogId,
            started: values.date?.toISOString() || new Date().toISOString(),
            timeSpentSeconds,
            originTaskId: issue?.id.toString() || "",
            remainingEstimate: values.remainingEstimate ? `${values.remainingEstimate}h` : null,
            endDate: null,
            includeNonWorkingDays: false,
          };
          await updateMutation.mutateAsync({ worklogId, params: updateParams });
        } else {
          // Create new worklog
          const createParams: JiraWorklogCreateParams = {
            worker: currentUser.key,
            comment: values.comment,
            started: startedDate,
            timeSpentSeconds,
            originTaskId: issue?.id.toString() || "",
            remainingEstimate: values.remainingEstimate ? `${values.remainingEstimate}h` : null,
            endDate: null,
            includeNonWorkingDays: false,
          };
          await createMutation.mutateAsync(createParams);
        }
        onUpdate?.();
        pop();
      } catch {
        // Error handling is done by mutation onError
      }
    },
  });

  useEffect(() => {
    if (worklogId && worklog) {
      setValue("date", new Date(worklog.started));
      setValue("timeSpent", worklog.timeSpent);
      setValue("comment", worklog.comment);
      setValue(
        "remainingEstimate",
        worklog.issue.epicIssue?.estimatedRemainingSeconds
          ? Math.floor(worklog.issue.epicIssue.estimatedRemainingSeconds / 3600).toString()
          : "",
      );
    }
  }, [worklog]);

  const createMutation = useJiraWorklogCreateMutation({
    onSuccess: () => {
      showToast({
        style: Toast.Style.Success,
        title: "Worklog Created",
        message: `Worklog for issue ${issueKey} has been created successfully`,
      });
    },
    onError: (error) => {
      showFailureToast(error, {
        title: "Failed to Create Worklog",
        message: `Failed to create worklog for issue ${issueKey}`,
      });
    },
  });

  const updateMutation = useJiraWorklogUpdateMutation({
    onSuccess: () => {
      showToast({
        style: Toast.Style.Success,
        title: "Worklog Updated",
        message: `Worklog for issue ${issueKey} has been updated successfully`,
      });
    },
    onError: (error) => {
      showFailureToast(error, {
        title: "Failed to Update Worklog",
        message: `Failed to update worklog for issue ${issueKey}`,
      });
    },
  });

  const handleCancel = () => {
    pop();
  };

  useEffect(() => {
    if (issueError) {
      showFailureToast(issueError, { title: "Failed to Load Issue" });
    }
  }, [issueError]);

  useEffect(() => {
    if (worklogError) {
      showFailureToast(worklogError, { title: "Failed to Load Worklog" });
    }
  }, [worklogError]);

  const isLoading = isIssueLoading || isWorklogLoading || createMutation.isPending || updateMutation.isPending;

  const displayValues = useMemo(() => {
    if (!issue) {
      return { issueKey: "-", summary: "-", assignee: "-" };
    }

    const assigneeName = issue.fields.assignee?.displayName;
    const isAssignee = currentUser?.key === issue.fields.assignee?.key;
    const assigneeTips = !isAssignee ? " (not assigned to you)" : "";
    return {
      issueKey: issue.key,
      summary: issue.fields.summary,
      assignee: assigneeName ? `${assigneeName}${assigneeTips}` : `Unassigned${assigneeTips}`,
    };
  }, [issue, currentUser]);

  const navigationTitle = worklogId ? "Edit Worklog" : "Create Worklog";

  return (
    <Form
      isLoading={isLoading}
      navigationTitle={navigationTitle}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" icon={Icon.Checkmark} onSubmit={handleSubmit} />
          <Action title="Go Back" icon={Icon.ArrowLeft} onAction={handleCancel} />
        </ActionPanel>
      }
    >
      <Form.Description title="Issue Key" text={displayValues.issueKey} />
      <Form.Description title="Summary" text={displayValues.summary} />
      <Form.Description title="Assignee" text={displayValues.assignee} />

      <Form.DatePicker {...itemProps.date} title="Date*" type={Form.DatePicker.Type.Date} />

      <Form.TextField {...itemProps.timeSpent} title="Worked*" placeholder="e.g. 2h 30m, 150m, 2.5h" />

      <Form.TextArea {...itemProps.comment} title="Description" placeholder="Enter work description..." />

      <Form.TextField {...itemProps.remainingEstimate} title="Remaining Estimate" placeholder="e.g. 4h, 240m" />
    </Form>
  );
}

// Helper function to parse time string to seconds
function parseTimeToSeconds(timeStr: string): number {
  const timeStrLower = timeStr.toLowerCase().trim();

  // Handle formats like "2h 30m", "2h", "30m", "2.5h", "150m"
  const hourMatch = timeStrLower.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = timeStrLower.match(/(\d+(?:\.\d+)?)\s*m/);

  let totalSeconds = 0;

  if (hourMatch) {
    totalSeconds += parseFloat(hourMatch[1]) * 3600;
  }

  if (minuteMatch) {
    totalSeconds += parseFloat(minuteMatch[1]) * 60;
  }

  // If no units specified, assume minutes
  if (!hourMatch && !minuteMatch) {
    const numberMatch = timeStrLower.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      totalSeconds = parseFloat(numberMatch[1]) * 60;
    }
  }

  return Math.round(totalSeconds);
}
