import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { Form, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { showFailureToast, useForm, FormValidation } from "@raycast/utils";

import { QueryProvider } from "@/components";
import { formatSecondsToWorkedTime, normalizeWorkedTime, formatWorkedTimeToSeconds } from "@/utils";
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

// Validate time format (e.g. "30m", "1h", "1h 30m", "1")
const TIME_REGEX = /^(\d+(?:\.\d+)?)\s*[hm]?(\s+(\d+(?:\.\d+)?)\s*[hm])?$/i;

export default function JiraWorklogFormProvider(props: JiraWorklogProps) {
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
    validation: {
      date: FormValidation.Required,
      timeSpent: (value) => {
        const trimmedValue = value?.trim();
        if (!trimmedValue) {
          return "The item is required";
        }
        if (!TIME_REGEX.test(trimmedValue)) {
          return "Invalid time. Use formats like '30m', '1h', or '1h 30m'";
        }
        const normalizedValue = normalizeWorkedTime(trimmedValue);
        const seconds = formatWorkedTimeToSeconds(normalizedValue);
        if (seconds <= 0) {
          return "Must be larger than 0";
        }
      },
      remainingEstimate: (value) => {
        if (value && value.trim().length) {
          if (!TIME_REGEX.test(value.trim())) {
            return "Invalid time. Use formats like '30m', '1h', or '1h 30m'";
          }
        }
      },
    },
    onSubmit: async (values) => {
      const commonParams = {
        originTaskId: issue!.id.toString(),
        started: dayjs(values.date).format("YYYY-MM-DD"),
        comment: values.comment, // default: Working on issue ${issueKey}
        timeSpentSeconds: formatWorkedTimeToSeconds(values.timeSpent),
        remainingEstimate: values.remainingEstimate === "" ? null : formatWorkedTimeToSeconds(values.remainingEstimate),

        // No Period
        endDate: null,
        includeNonWorkingDays: false,
      };

      if (worklogId) {
        // Update existing worklog
        const updateParams: JiraWorklogUpdateParams = {
          originId: worklogId,
          ...commonParams,
        };
        await updateMutation.mutateAsync({ worklogId, params: updateParams });
      } else {
        // Create new worklog
        const createParams: JiraWorklogCreateParams = {
          worker: currentUser!.key,
          ...commonParams,
        };
        await createMutation.mutateAsync(createParams);
      }
      onUpdate?.();
      pop();
    },
  });

  useEffect(() => {
    if (worklogId && worklog) {
      setValue("date", new Date(worklog.started));
      setValue("timeSpent", formatSecondsToWorkedTime(worklog.timeSpentSeconds));
      setValue("comment", worklog.comment);
      // TODO:
      setValue(
        "remainingEstimate",
        worklog.issue.epicIssue?.estimatedRemainingSeconds
          ? Math.floor(worklog.issue.epicIssue.estimatedRemainingSeconds / 3600).toString()
          : "",
      );
    }
  }, [worklog]);

  useEffect(() => {
    // TODO: 3w、4d
    if (issue && !worklogId) {
      setValue("date", new Date());
      setValue("remainingEstimate", issue.fields.timetracking?.remainingEstimate || "");
    }
  }, [issue, worklogId]);

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

  const displayValues = useMemo(() => {
    if (!issue) {
      return { issueKey: "-", summary: "-", assignee: "-", originalEstimate: "", loggedTime: "" };
    }

    const assigneeName = issue.fields.assignee?.displayName;
    const isAssignee = currentUser?.key === issue.fields.assignee?.key;
    const assigneeTips = isAssignee ? "" : " (not assigned to you)";
    return {
      issueKey: issue.key,
      summary: issue.fields.summary,
      assignee: assigneeName ? `${assigneeName}${assigneeTips}` : `Unassigned${assigneeTips}`,
      originalEstimate: issue.fields.timetracking?.originalEstimate || "",
      loggedTime: issue.fields.timetracking?.timeSpent || "",
    };
  }, [issue, currentUser]);

  const isLoading = isIssueLoading || isWorklogLoading || createMutation.isPending || updateMutation.isPending;
  const navigationTitle = worklogId ? "Edit Worklog" : "Create Worklog";
  const canSubmit = issue && (!worklogId || (worklogId && worklog));

  return (
    <Form
      isLoading={isLoading}
      navigationTitle={navigationTitle}
      actions={
        <ActionPanel>
          {canSubmit && <Action.SubmitForm title="Submit" icon={Icon.Checkmark} onSubmit={handleSubmit} />}
          <Action title="Go Back" icon={Icon.ArrowLeft} onAction={handleCancel} />
        </ActionPanel>
      }
    >
      <Form.Description title="Issue Key" text={displayValues.issueKey} />
      <Form.Description title="Summary" text={displayValues.summary} />
      <Form.Description title="Assignee" text={displayValues.assignee} />
      {/* The amount of time you originally believe is required to resolve the issue. */}
      {displayValues.originalEstimate && (
        <Form.Description title="Original Estimate" text={displayValues.originalEstimate} />
      )}
      {displayValues.loggedTime && <Form.Description title="Σ Logged" text={displayValues.loggedTime} />}
      <Form.Separator />
      <Form.DatePicker {...itemProps.date} title="Date*" type={Form.DatePicker.Type.Date} />
      <Form.TextField
        {...itemProps.timeSpent}
        title="Worked*"
        placeholder="e.g. 30m, 1h, 1h 30m"
        onBlur={(event) => {
          const value = event.target.value;
          if (!value) return;
          const formattedTime = normalizeWorkedTime(value);
          if (formattedTime !== value) setValue("timeSpent", formattedTime);
        }}
      />
      <Form.TextArea
        {...itemProps.comment}
        title="Description"
        placeholder="description for worklog..."
        onBlur={(event) => {
          const value = event.target.value || "";
          const trimmedValue = value.trim();
          if (value && trimmedValue !== value) {
            setValue("comment", trimmedValue);
          }
        }}
      />
      <Form.TextField
        {...itemProps.remainingEstimate}
        title="Remaining Estimate"
        placeholder="e.g. 30m, 1h, 1h 30m"
        info="The amount of time you believe is required to resolve the issue in its current state."
        onBlur={(event) => {
          const value = event.target.value;
          if (!value) return;
          const formattedTime = normalizeWorkedTime(value);
          if (formattedTime !== value) setValue("remainingEstimate", formattedTime);
        }}
      />
    </Form>
  );
}
