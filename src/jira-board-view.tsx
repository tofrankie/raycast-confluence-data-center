import { useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import { QueryProvider, DebugActions } from "@/components";
import { JiraIssueTransitionForm } from "@/pages";
import {
  useJiraBoards,
  useJiraBoardActiveSprint,
  useJiraBoardConfiguration,
  useJiraBoardSprintIssues,
  useJiraKanbanBoardIssuesInfiniteQuery,
  useJiraBoardCachedState,
} from "@/hooks";
import { processAndGroupSprintIssues } from "@/utils";
import { JIRA_BOARD_TYPE, PAGINATION_SIZE } from "./constants";
import type { ProcessedJiraKanbanBoardIssue } from "@/types";

export default function JiraBoardViewProvider() {
  return (
    <QueryProvider>
      <JiraBoardView />
    </QueryProvider>
  );
}

function JiraBoardView() {
  const { boardId, setBoardId, sprintId, setSprintId, boardType, setBoardType } = useJiraBoardCachedState();

  const { data: boards, isLoading: boardsLoading, error: boardsError, isSuccess: boardsSuccess } = useJiraBoards();

  const {
    data: boardConfiguration,
    error: boardConfigurationError,
    isLoading: boardConfigurationLoading,
  } = useJiraBoardConfiguration(boardId, {
    enabled: boardId > -1,
  });

  const {
    data: sprint,
    error: sprintError,
    isLoading: sprintLoading,
    isSuccess: sprintSuccess,
  } = useJiraBoardActiveSprint(boardId, {
    enabled: boardId > -1 && boardType === JIRA_BOARD_TYPE.SCRUM,
  });

  const {
    data: sprintIssues,
    isLoading: sprintIssuesLoading,
    error: sprintIssuesError,
    refetch: refetchSprintIssues,
  } = useJiraBoardSprintIssues(boardId, sprintId, {
    enabled: boardId > -1 && sprintId > -1 && boardType === JIRA_BOARD_TYPE.SCRUM,
  });

  const {
    data: kanbanIssues,
    error: kanbanIssuesError,
    isLoading: kanbanIssuesLoading,
    isFetchingNextPage: isFetchingNextKanbanIssues,
    hasNextPage: hasNextKanbanIssues,
    fetchNextPage: fetchNextKanbanIssues,
    refetch: refetchKanbanIssues,
  } = useJiraKanbanBoardIssuesInfiniteQuery(boardId, {
    enabled: boardId > -1 && boardType === JIRA_BOARD_TYPE.KANBAN,
  });

  useEffect(() => {
    const hasBoards = boardsSuccess && boards;
    if (!hasBoards) return;

    let nextBoard = boards.find((board) => board.id === boardId);
    if (!nextBoard && boards.length > 0) {
      nextBoard = boards[0];
    }

    const nextBoardId = nextBoard?.id ?? -1;
    if (nextBoardId !== boardId) {
      setBoardId(nextBoardId);
    }

    setBoardType(nextBoard?.type ?? JIRA_BOARD_TYPE.SCRUM);
  }, [boardsSuccess, boards]);

  useEffect(() => {
    if (sprint && sprint.id !== sprintId) {
      setSprintId(sprint.id);
    }
  }, [sprint, sprintId]);

  useEffect(() => {
    if (boardsError) {
      showFailureToast(boardsError, { title: "Failed to Load Boards" });
    }
  }, [boardsError]);

  useEffect(() => {
    if (sprintError) {
      showFailureToast(sprintError, { title: "Failed to Load Sprint" });
    }
  }, [sprintError]);

  useEffect(() => {
    if (boardConfigurationError) {
      showFailureToast(boardConfigurationError, { title: "Failed to Load Board Configuration" });
    }
  }, [boardConfigurationError]);

  useEffect(() => {
    if (sprintIssuesError) {
      showFailureToast(sprintIssuesError, { title: "Failed to Load Sprint Issues" });
    }
  }, [sprintIssuesError]);

  useEffect(() => {
    if (kanbanIssuesError) {
      showFailureToast(kanbanIssuesError, { title: "Failed to Load Board Issues" });
    }
  }, [kanbanIssuesError]);

  const groupedIssues = useMemo(() => {
    if (!boardConfiguration?.columnConfig.columns || !sprintIssues?.issues) {
      return {};
    }
    return processAndGroupSprintIssues(sprintIssues.issues, boardConfiguration);
  }, [sprintIssues, boardConfiguration]);

  const onBoardChange = (value: string) => {
    if (!boardsSuccess) return;

    setBoardId(Number(value));

    const board = boards.find((board) => board.id.toString() === value);
    setBoardType(board?.type ?? JIRA_BOARD_TYPE.SCRUM);
  };

  const handleLoadMore = () => {
    if (hasNextKanbanIssues && !isFetchingNextKanbanIssues) {
      fetchNextKanbanIssues();
    }
  };

  const handleRefresh = async () => {
    try {
      if (boardType === JIRA_BOARD_TYPE.KANBAN) {
        await refetchKanbanIssues();
      } else {
        await refetchSprintIssues();
      }
      showToast(Toast.Style.Success, "Refreshed");
    } catch {
      // Error handling is done by useEffect
    }
  };

  const isLoading =
    boardsLoading || sprintLoading || boardConfigurationLoading || sprintIssuesLoading || kanbanIssuesLoading;

  if (!boardId && boards?.length) {
    return (
      <List
        isLoading={boardsLoading}
        searchBarPlaceholder="Select Board"
        searchBarAccessory={
          <List.Dropdown tooltip="Select Board" value={boardId.toString()} onChange={onBoardChange} storeValue>
            {boards.map((board) => (
              <List.Dropdown.Item key={board.id} title={board.name} value={board.id.toString()} />
            ))}
          </List.Dropdown>
        }
      >
        <List.EmptyView
          icon={Icon.List}
          title="Select Board"
          description="Choose a board from the dropdown to view its active sprint issues"
        />
      </List>
    );
  }

  return (
    <List
      throttle
      isLoading={isLoading}
      searchBarPlaceholder="Filter by summary, key, assignee, epic, status..."
      searchBarAccessory={
        <List.Dropdown tooltip="Select Board" value={boardId.toString()} onChange={onBoardChange} storeValue>
          {boards?.map((board) => (
            <List.Dropdown.Item key={board.id} title={board.name} value={board.id.toString()} />
          ))}
        </List.Dropdown>
      }
      pagination={
        boardType === JIRA_BOARD_TYPE.KANBAN
          ? {
              hasMore: kanbanIssues?.hasMore || false,
              onLoadMore: handleLoadMore,
              pageSize: PAGINATION_SIZE,
            }
          : undefined
      }
    >
      {boardType === JIRA_BOARD_TYPE.KANBAN ? (
        <KanbanList
          issues={kanbanIssues?.issues}
          sectionTitle={`Results (${kanbanIssues?.issues.length || 0}/${kanbanIssues?.totalCount || 0})`}
          onRefresh={handleRefresh}
        />
      ) : sprintSuccess && !sprint ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Results"
          description="This board doesn't have an active sprint"
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              <DebugActions />
            </ActionPanel>
          }
        />
      ) : (
        <ScrumList groupedIssues={groupedIssues} onRefresh={handleRefresh} />
      )}
    </List>
  );
}

interface KanbanListProps {
  issues?: ProcessedJiraKanbanBoardIssue[];
  sectionTitle: string;
  onRefresh: () => void;
}

function KanbanList({ issues, sectionTitle, onRefresh }: KanbanListProps) {
  if (!issues || issues.length === 0) {
    return (
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title="No Results"
        description="No issues found in this board"
        actions={
          <ActionPanel>
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={onRefresh} />
            <DebugActions />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List.Section title={sectionTitle}>
      {issues.map((item) => (
        <BoardIssueItem key={item.renderKey} item={item} onRefresh={onRefresh} />
      ))}
    </List.Section>
  );
}

interface ScrumListProps {
  groupedIssues: Record<string, ProcessedJiraKanbanBoardIssue[]>;
  onRefresh: () => void;
}

function ScrumList({ groupedIssues, onRefresh }: ScrumListProps) {
  return (
    <>
      {Object.entries(groupedIssues).map(([columnName, issues]) => (
        <List.Section key={columnName} title={`${columnName} (${issues.length})`}>
          {issues.map((item) => (
            <BoardIssueItem key={item.renderKey} item={item} onRefresh={onRefresh} />
          ))}
        </List.Section>
      ))}
    </>
  );
}

interface BoardIssueItemProps {
  item: ProcessedJiraKanbanBoardIssue;
  onRefresh: () => void;
}

function BoardIssueItem({ item, onRefresh }: BoardIssueItemProps) {
  return (
    <List.Item
      key={item.renderKey}
      title={item.title}
      subtitle={item.subtitle}
      icon={item.icon}
      accessories={item.accessories}
      keywords={item.keywords}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Browser" url={item.url} />
          <Action.OpenInBrowser
            icon={Icon.Pencil}
            title="Edit in Browser"
            url={item.editUrl}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
          />
          <Action.Push
            title="Transition Status"
            target={<JiraIssueTransitionForm issueKey={item.key} onUpdate={onRefresh} />}
            icon={Icon.Switch}
            shortcut={{ modifiers: ["cmd"], key: "t" }}
          />
          <Action.CopyToClipboard title="Copy URL" shortcut={{ modifiers: ["cmd"], key: "c" }} content={item.url} />
          <Action.CopyToClipboard
            title="Copy Key"
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            content={item.key}
          />
          <Action.CopyToClipboard
            title="Copy Summary"
            shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
            content={item.summary}
          />
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={onRefresh}
          />
          <DebugActions />
        </ActionPanel>
      }
    />
  );
}
