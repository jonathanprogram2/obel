import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import boboAvatar from "../assets/bobo-avatar.png";




const INITIAL_COLUMNS = {
    todo: [
        {
            id: "DEV-201",
            title: "Refactor user authentication flow",
            priority: "High Priority",
            due: "Nov 10",
            assignees: ["AJ", "SL"],
            tag: "Backend",
        },
        {
            id: "DES-54",
            title: "Design new dashboard widgets",
            priority: "Medium Priority",
            due: "Nov 12",
            assignees: ["SL"],
            tag: "UI Design",
            suggestion: "AI Suggestion",
            suggestionText: "Link the 'Analytics API' doc for data source context.",
        },
    ],
    inProgress: [
        {
            id: "API-89",
            title: "Develop new endpoint for customer data",
            priority: "High Priority",
            due: "Nov 8",
            assignees: ["AJ"],
            tag: "API",
        },
        {
            id: "DOCS-21",
            title: "Update API documentation for v2.5 release",
            priority: "Medium Priority",
            due: "Nov 9",
            assignees: ["MC"],
            tag: "Docs",
        },
    ],
    done: [
        {
            id: "BUG-404",
            title: "Fix critical login page bug",
            priority: "High Priority",
            due: "Nov 1",
            assignees: ["AJ"],
            tag: "Bugfix",
        },
        {
            id: "UX-33",
            title: "Research competitor onboarding flows",
            priority: "Low Priority",
            due: "Oct 28",
            assignees: ["SL"],
            tag: "Research",
        },
    ],
};

const PRIORITY_STYLES = {
    "High Priority": "bg-rose-500/10 text-rose-200 border-rose-400/60",
    "Medium Priority": "bg-amber-400/10 text-amber-200 border-amber-300/60",
    "Low Priority": "bg-emerald-500/10 text-emerald-200 border-emerald-300/60",
};

const STATUS_OPTIONS = [
    { value: "todo", label: "To Do" },
    { value: "inProgress", label: "In Progress" },
    { value: "done", label: "Done" }
];

const PRIORITY_OPTIONS = [
    "High Priority",
    "Medium Priority",
    "Low Priority",
];

const STATUS_COLOR_MAP = {
    todo: "#34d399",
    inProgress: "#38bdf8",
    done: "#a855f7",
};

const STATUS_COLOR_CLASS = {
    todo: "text-emerald-400",
    inProgress: "text-sky-400",
    done: "text-purple-400",
};



const WorkspacePage = () => {
    const [showHelp, setShowHelp] = useState(false);

    const COLUMN_KEYS = ["todo", "inProgress", "done"];
    const [columns, setColumns] = useState(() => {
        if (typeof window === "undefined") return INITIAL_COLUMNS;

        try {
            const raw = window.localStorage.getItem("obel_workspace_columns");
            if (!raw) return INITIAL_COLUMNS;

            const parsed = JSON.parse(raw);

            const isValid = COLUMN_KEYS.every((key) =>
                Array.isArray(parsed[key]) &&
                parsed[key].every(
                    (t) => t && typeof t.id === "string"
                )
            );

            if (!isValid) {
                console.warn(
                    "[Workspace] Saved columns were invalid, falling back to INITIAL_COLUMNS."
                );
                return INITIAL_COLUMNS;
            }

            return parsed;
        } catch (err) {
            console.error("Failed to load saved columns:", err);
            return INITIAL_COLUMNS;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(
                "obel_workspace_columns",
                JSON.stringify(columns)
            );
        } catch (err) {
            console.error("Failed to save columns:", err);
        }
    }, [columns]);

    const [editingTask, setEditingTask] = useState(null);

    const editingTaskRef = useRef(null);

    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskDraft, setTaskDraft] = useState({
        title: "",
        assignee: "",
        dueRange: "",
        project: "",
        status: "todo",
        priority: "Medium Priority",
        description: "",
        comments: [],
        avatarColor: "#facc15",
    });

    const [newComment, setNewComment] = useState("");

    // Basic drag state
    const [dragInfo, setDragInfo] = useState(null); 
    const [dragOverSlot, setDragOverSlot] = useState(null);
    const lastDropTargetRef = useRef(null);

    const statusRef = useRef(null);
    const priorityRef = useRef(null);

    // Delete confirmation state
    const [pendingDelete, setPendingDelete] = useState(null); // {columnId, task}

    // Simple incremental ID helper for new tasks
    const [newTaskCounter, setNewTaskCounter] = useState(1);

    const makeNewTask = (columnId) => {
        const num = newTaskCounter;
        const prefix =
            columnId === "todo"
                ? "DEV"
                : columnId === "inProgress"
                ? "WIP"
                : "DONE";
        setNewTaskCounter((n) => n + 1);

        return {
            id: `${prefix}-NEW-${num}`,
            title: "New task",
            priority: "Medium Priority",
            due: "TBD",
            assignees: ["JM"],
            tag: "General",
        };
    };

    const deleteTaskFromColumns = (cols, columnId, taskId) => ({
        ...cols,
        [columnId]: (cols[columnId] || []).filter(
            (t) => t.id !== taskId),
    });


    // ------ Drag + drop handlers ---------
    const handleDragStart = (taskId, fromColumnId, fromIndex) => {
        setDragInfo({ taskId, fromColumnId, fromIndex });
        lastDropTargetRef.current = null;
    };

    const handleDragEnterSlot = (columnId, index) => {
        if (!dragInfo) return;
        setDragOverSlot({ columnId, index });
    };

    const moveDraggedTask = (toColumnId, toIndex) => {
        if (!dragInfo) return;

        lastDropTargetRef.current = toColumnId;

        setColumns((prev) => {
            const { taskId, fromColumnId, fromIndex } = dragInfo;

            const fromTasksRaw = Array.isArray(prev[fromColumnId])
                ? prev[fromColumnId]
                : [];
            
            const fromTasks = fromTasksRaw.filter((t) => t && typeof t.id === "string");
            if (!fromTasks.length) return prev;

            let sourceIndex = 
                typeof fromIndex === "number"
                    ? fromIndex
                    : fromTasks.findIndex((t) => t.id === taskId);

            if (sourceIndex < 0) return prev;

            const copyFrom = [...fromTasks];

            // Pull the task out of the source column
            const [moved] = copyFrom.splice(sourceIndex, 1);
            if (!moved) return prev;

            const destRaw = Array.isArray(prev[toColumnId])
                ? prev[toColumnId]
                : [];

            // Decide the destination list
            const baseDestTasks =
                fromColumnId === toColumnId 
                    ? copyFrom
                    : destRaw.filter((t) => t && typeof t.id === "string");

            let insertIndex =
                typeof toIndex === "number" ? toIndex : baseDestTasks.length;

            // If staying in same column and dropping *after* oiriginal position,
            // shift the index back by one
            if (fromColumnId === toColumnId && sourceIndex < insertIndex) {
                insertIndex -= 1;
            }

            const destTasks = [...baseDestTasks];
            destTasks.splice(insertIndex, 0, moved);

            return {
                ...prev,
                [fromColumnId]: fromColumnId === toColumnId ? destTasks : copyFrom,
                [toColumnId]: destTasks,
            };
        });

        setDragInfo(null);
        setDragOverSlot(null);
    };

    const handleDragEnd = () => {
        // if dropped outside any column/card, treat as drag-to-delete
        if (dragInfo && !lastDropTargetRef.current) {
            const { fromColumnId, taskId } = dragInfo;
            const task = columns[fromColumnId]?.find((t) => t.id === taskId);

            if (task) {
                setPendingDelete({ columnId: fromColumnId, task });
            }
        }

        setDragInfo(null);
        setDragOverSlot(null);
        lastDropTargetRef.current = null;
    };

    // ------ Delete modal action -----
    const handleConfirmDelete = () => {
        if (!pendingDelete) return;
        setColumns((prev) => 
            deleteTaskFromColumns(prev, pendingDelete.columnId, pendingDelete.task.id)
        );
        setPendingDelete(null);
    };

    const handleCancelDelete = () => {
        setPendingDelete(null);
    };


    // Simple AI chat state
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState([]);


    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: "user",
            text: input.trim(),
            timestamp: "Just now",
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsThinking(true);

        try {
            const res = await fetch("http://localhost:5001/api/assistant/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: "jonathan-demo",  // later: real auth user id
                    message: userMessage.text,
                    tasks: columns,           // kanban columns object
                }),
            });

            const data = await res.json();

            const assistantText =
                data.reply ||
                "I'm having trouble reaching the AI backend right now, but your request went through from the UI side.";

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: assistantText,
                    timestamp: "Just now",
                    type: "answer",
                }
            ]);

            // If BoBo sent structured tasks, add them to the board
            if (Array.isArray(data.suggestedTasks) && data.suggestedTasks.length > 0) {
                setColumns((prev) => {
                    const next = { ...prev };

                    data.suggestedTasks.forEach((t) => {
                        const status =
                            t.status === "inProgress" || t.status === "done"
                                ? t.status
                                : "todo";

                        const priority = PRIORITY_OPTIONS.includes(t.priority)
                            ? t.priority
                            : "Medium Priority";

                        const newTask = {
                            id: generateAiTaskId(),
                            title: t.title || "New AI task",
                            priority,
                            due: "TBD",
                            assignees: ["AI"],
                            tag: t.tag || "General",
                            description: "",
                            comments: [],
                            avatarColor: "#38bdf8", // light cyan for AI-created cards
                        };

                        next[status] = [...(next[status] || []), newTask];
                    });

                    return next;
                });
            }
        } catch (err) {
            console.error("Assistant error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        "Hmm, I couldn't reach the AI service. Double-check that your backend is running on port 5000 with /api/assistant/chat.",
                    timestamp: "Just now",
                    type: "error",
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    };


    const openTaskModal = (columnId, task) => {
        if (task) {
            // Editing existing task
            setEditingTask({ columnId, taskId: task.id });
            editingTaskRef.current = { columnId, taskId: task.id };


            setTaskDraft({
                title: task.title || "",
                assignee:
                    task.assignees && task.assignees.length
                        ? task.assignees[0]
                        : "",
                dueRange: task.due === "TBD" ? "" : task.due || "",
                project: task.tag || "",
                status: columnId || "todo",
                priority: task.priority || "Medium Priority",
                description: task.description || "",
                comments: task.comments || [],
                avatarColor: task.avatarColor || "#facc15",
            });
        } else {
            // Brand new task
            setEditingTask(null);
            editingTaskRef.current = null;

            setTaskDraft({
                title: "",
                assignee: "",
                dueRange: "",
                project: "",
                status: columnId || "todo",
                priority: "Medium Priority",
                description: "",
                comments: [],
                avatarColor: "#facc15",
            });
        }
        setNewComment("");
        setTaskModalOpen(true);
    };

    const handleAddCommentToDraft = () => {
        if (!newComment.trim()) return;

        const now = new Date();
        const timestamp = now.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

        const comment = {
            id: now.getTime(),
            author: "You",
            text: newComment.trim(),
            timestamp,
        };
        setTaskDraft((prev) => ({
            ...prev,
            comments: [...prev.comments, comment],
        }));
        setNewComment("");
    };

    // use your existing counter but use this to actually create a task from modal
    const handleCreateTaskFromDraft = () => {
        const trimmedTitle = taskDraft.title.trim();
        if (!trimmedTitle) {
            setTaskModalOpen(false);
            setEditingTask(null);
            return;
        }

        const statusOption = STATUS_OPTIONS.find(
            (opt) => opt.value === taskDraft.status || opt.label === taskDraft.status
        );

        const columnId = statusOption ? statusOption.value : "todo";

        const initials = taskDraft.assignee
            ? taskDraft.assignee
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "JM";

        if (editingTask) {
            // Update existing card (and possibly move column)
            setColumns((prev) => {
                const copy = { ...prev };

                const fromCol = editingTask.columnId;
                const fromTasks = copy[fromCol] || [];
                const existing = fromTasks.find((t) => t.id === editingTask.taskId);
                if (!existing) return prev;

                const updatedTask = {
                    ...existing,
                    title: trimmedTitle,
                    priority: taskDraft.priority,
                    due: taskDraft.dueRange || "TBD",
                    assignees: [initials],
                    tag: taskDraft.project || "General",
                    description: taskDraft.description,
                    comments: taskDraft.comments,
                    avatarColor: taskDraft.avatarColor || "#facc15",
                };

                // remove from original column
                copy[fromCol] = fromTasks.filter((t) => t.id !== editingTask.taskId);
                // add to new column
                copy[columnId] = [...(copy[columnId] || []), updatedTask];

                return copy;
            });
        } else {
            // CREATE new card
            const num = newTaskCounter;
            const prefix =
                columnId === "todo" ? "DEV" : columnId === "inProgress" ? "WIP" : "DONE";
            setNewTaskCounter((n) => n + 1);

            const newTask = {
            id: `${prefix}-NEW-${num}`,
            title: taskDraft.title.trim(),
            priority: taskDraft.priority,
            due: taskDraft.dueRange || "TBD",
            assignees: [initials],
            tag: taskDraft.project || "General",
            description: taskDraft.description,
            comments: taskDraft.comments,
            avatarColor: taskDraft.avatarColor,
        };

        setColumns((prev) => ({
            ...prev,
            [columnId]: [...(prev[columnId] || []), newTask],
        }));
    }

        setTaskModalOpen(false);
        setEditingTask(null);
    };

    const handleDeleteFromModal = () => {
        // If editing an existing task, remove it from its column
        if (editingTaskRef.current) {
            const { columnId, taskId } = editingTaskRef.current;
            setColumns((prev) => deleteTaskFromColumns(prev, columnId, taskId));
        }

        editingTaskRef.current = null;
        setTaskModalOpen(false);
    }

    const handleModalMouseDown = (e) => {
        // If the click is NOT inside the status dropdown wrapper,
        // close the status menu
        if (statusRef.current && !statusRef.current.contains(e.target)) {
            setIsStatusOpen(false);
        }

        // Same for priority
        if (priorityRef.current && !priorityRef.current.contains(e.target)) {
            setIsPriorityOpen(false);
        }
    };

    const avatarColorInputRef = useRef(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            })
        }
    }, [messages]);


    const generateAiTaskId = () => {
        const num = Math.floor(100 + Math.random() * 900);
        return `AI-${num}`;
    };

    return (
        <div className="min-h-screen bg-[#04060a] text-white flex">
            {/* Left side: Obel sidebar is already in your app; this page assumes it's outside this component */}

            <div className="flex-1 max-w-8xl mx-auto pt-12 pb-10 px-6 lg:px-10 flex gap-6 items-start">
                {/* Main content: title + board */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Header */}
                    <div>
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={() => setShowHelp(true)}
                                className="mt-1 text-[11px] font-medium text-gray-400 hover:text-yellow-300 underline underline-offset-4"
                            >
                                What's this page?
                            </button>
                        </div>

                        <p className="text-xs uppercase tracking-[0.22em] text-yellow-400/80 mb-1">
                            Workspace
                        </p>

                        <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-1">
                            Here's your task breakdown for today.
                        </h1>

                        <p className="text-sm text-gray-300">
                            Let's get it done — your AI assistant will keep you focused on what matters.
                        </p>
                    </div>
            
                    <div className="workspace-new-task-row flex justify-end mb-2"> 
                        <button
                            className="workspace-new-task-btn hidden md:inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 text-black px-8 py-1.5 text-sm font-semibold min-w-[137px] shadow-[0_0_18px_rgba(234,179,8,0.6)] hover:bg-yellow-300 transition mb-2"
                            onClick={() => openTaskModal("todo")} 
                        >
                            + New Task
                        </button>
                    </div>
           
                    {/* Kanban board*/}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="obel-glass-board mt-2"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
                            {[
                                { id: "todo", label: "To Do" },
                                { id: "inProgress", label: "In Progress" },
                                { id: "done", label: "Done" },
                            ].map((col) => (
                                <div
                                    key={col.id}
                                    className="obel-glass-column group flex h-full flex-col"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const count = (columns[col.id] || []).length;
                                        moveDraggedTask(col.id, count);
                                    }}
                                >
                                    <div 
                                        className="obel-glass-column-inner flex flex-col h-full"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] ${
                                                        col.id === "todo"
                                                            ? "bg-emerald-400"
                                                            : col.id === "inProgress"
                                                            ? "bg-sky-400"
                                                            : "bg-purple-400"
                                                    }`}
                                                />
                                                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-100">
                                                    {col.label}
                                                </h2>
                                            </div>
                                            <span className="text-[0.7rem] rounded-full border border-white/15 bg-white/10 px-2 py-[2px] text-gray-300">
                                                {(columns[col.id] || []).length} tasks
                                            </span>
                                        </div>
                                        
                                        <div className="px-0 pb-1 flex-1 space-y-3">
                                            {(columns[col.id] || [])
                                                .filter((task) => task && typeof task.id === "string")
                                                .map((task, index) => (
                                                <div
                                                    key={task.id}
                                                    className="obel-task-card obel-task-card--glass"
                                                    draggable
                                                    onClick={() => openTaskModal(col.id, task)}
                                                    onDragStart={() => handleDragStart(task.id, col.id, index)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDragEnter={(e) => {
                                                        e.preventDefault();
                                                        handleDragEnterSlot(col.id, index);
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        moveDraggedTask(col.id, index);
                                                    }}
                                                >
                                                    <div className="obel-task-card__body space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                                                                {task.id}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] px-2 py-[3px] rounded-full border ${
                                                                    PRIORITY_STYLES[task.priority] ||
                                                                    "bg-slate-700/40 text-slate-200 border-slate-400/50"
                                                                }`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-semibold leading-snug">
                                                            {task.title}
                                                        </p>
                                                        {task.tag && (
                                                            <span className="inline-flex text-[10px] px-2 py-[3px] rounded-full bg-sky-500/10 text-sky-200 border border-sky-400/40">
                                                                {task.tag}
                                                            </span>
                                                        )}

                                                        {task.suggestion && (
                                                            <div className="mt-2 rounded-lg bg-[#08101c] border border-sky-500/40 px-3 py-2">
                                                                <p className="text-[10px] uppercase tracking-[0.18em] text-sky-300 mb-1">
                                                                    {task.suggestion}
                                                                </p>
                                                                <p className="text-xs text-gray-200">
                                                                    {task.suggestionText}
                                                                </p>
                                                                <div className="mt-2 flex gap-2">
                                                                    <button className="text-[10px] text-gray-400 hover:text-gray-200">
                                                                        Dismiss
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-1">
                                                            <span className="text-[11px] text-gray-400">
                                                                {task.due}
                                                            </span>
                                                            <div className="flex -space-x-1">
                                                                {task.assignees?.map((initials) => (
                                                                    <div
                                                                        key={initials}
                                                                        className="h-6 w-6 rounded-full text-[11px] font-semibold flex items-center justify-center border border-[#04060a]"
                                                                        style={{
                                                                            background:
                                                                                task.avatarColor ||
                                                                                "linear-gradient(to bottom right, #facc15, #f97316)",
                                                                        }}
                                                                    >
                                                                        {initials}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className="h-6"
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const count = (columns[col.id] || []).length;
                                                    moveDraggedTask(col.id, count);
                                                }}
                                            />
                                            <button 
                                                className="w-full mt-1 text-[11px] text-gray-400 hover:text-yellow-200 text-left px-1"
                                                onClick={() => openTaskModal(col.id)}
                                            >
                                                + Add task
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                </motion.div>
            </div>

            {/* Right side: AI Assistant */}
            <motion.aside
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="obel-ai-panel hidden lg:flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-black/40 border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_18px_rgba(34,211,238,0.7)]">
                            <img 
                                src={boboAvatar}
                                alt="BoBo avatar"
                                className="h-9 w-9 object-contain"
                            />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-violet-300/90">
                                BoBo, Your AI workspace assistant
                            </p>
                            <p className="text-[13px] text-gray-400">
                                Always here to help you focus
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conversation list */}
                <div className="assistant-scroll flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                    {/* Centered glowing placeholder when there are no messages yet */}
                    {messages.length === 0 && !isThinking && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm md:text-2xl font-medium text-white/70 animate-pulse drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]">
                                Ready to help
                            </span>
                        </div>
                    )}

                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl border px-3 py-3 text-sm ${
                                m.role === "assistant"
                                    ? "bg-white/3 border-violet-400/40 text-gray-100"
                                    : "bg-[#05070d] border-white/10 text-gray-100"
                            }`}
                        >
                            {m.type === "insight" && (
                                <p className="text-[11px] uppercase tracking-[0.16em] text-violet-300 mb-1">
                                    Smart Insight
                                </p>
                            )}
                            <p className="whitespace-pre-line">{m.text}</p>
                            <p className="mt-1 text-[11px] text-gray-400">{m.timestamp}</p>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="rounded-2xl border border-violet-400/40 bg-white/5 px-3 py-2.5 text-xs text-gray-200">
                            Thinking about your board...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="mt-auto">
                    <p className="text-[14px] text-gray-400 mb-1">
                        Ask anything about your tasks:
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            className="flex-1 rounded-full bg-[#05070d] border border-white/12 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-400"
                            placeholder="e.g. Help me prioritize today's work"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSend();
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isThinking}
                            className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center text-sm font-bold hover:bg-violet-400 disabled:opacity-60"
                        >
                            ⮞
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* What is this page? modal */}
            {showHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        className="max-w-3xl w-full rounded-2xl border border-yellow-500/60 bg-[#050509] p-9 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                How the workspace page works
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowHelp(false)}
                                className="text-sm text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-base leading-relaxed text-gray-200">
                            <section>
                                <h3 className="text-sm font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    1. Kanban board
                                </h3>
                                <p>
                                    The three columns — <span className="font-semibold">To Do</span>, <span className="font-semibold">In Progress</span>, and <span className="font-semibold">Done</span> — make up your personal task board.
                                    Use "+ New Task" to add a new task card and/or drag cards between columns as you work.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-sm font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    2. Deep-dive task details
                                </h3>
                                <p>
                                    Click any card to open the task modal. From there you can change the status, set a due date, give it a project label, add a description, and leave comments.
                                    You can also color-code the avatar so important tasks visually pop on the board.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-sm font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    3. BoBo, your AI workspace assistant
                                </h3>
                                <p>
                                    On the right, you have your own personal AI workspace assistant named "BoBo".
                                    It can read your whole board and answer questions like
                                    "What should I work on first?"; "What's the newest task I created?"; or 
                                    "Help me break this task into subtasks." You can also ask it to{" "}
                                    <span className="font-semibold text-yellow-200">
                                        create a new task based on your board
                                    </span>
                                    , and BoBo will generate a task card and drop it onto your board for you.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-sm font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    4. How this fits in Obel
                                </h3>
                                <p>
                                    This page is designed as your <span className="font-semibold text-yellow-200">daily focus hub</span>.
                                    The board state is saved locally so you can move tasks around, refine them over time, and let BoBo learn your workflow —
                                    all without needing external tools to get started.
                                </p>
                            </section>

                            <p className="text-sm text-gray-400 mt-4 border-t border-yellow-500/20 pt-3">
                                Think of this workspace as your <span className="text-yellow-200 font-medium">command center</span> for projects:
                                a place where tasks live, AI helps you make decisions, and everything stays visually organized inside Obel.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowHelp(false)}
                                className="px-5 py-2 rounded-full bg-yellow-400 text-xs font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                            >
                                Got it
                            </button>
                        </div>
                        </div>
                    </div>
                )}

                {/* Delete-on-drag-outside modal */}
                {pendingDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                        <div className="w-full max-w-md rounded-2xl border border-rose-400/70 bg-[#050509] p-6 shadow-[0_0_40px_rgba(248,113,113,0.65)]">
                            <h3 className="text-base font-semibold mb-2">
                                Delete this card?
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-white">
                                    {pendingDelete.task.title}
                                </span>
                                ? This action can't be undone.
                            </p>


                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 rounded-full text-xs font-semibold text-gray-200 bg-white/5 hover:bg-white/10"
                                >
                                    No, keep card
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 rounded-full text-xs font-semibold text-black bg-rose-400 hover:bg-rose-300 shadow-[0_0_18px_rgba(248,113,113,0.7)]"
                                >
                                    Yes, delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Task / Edit Task modal */}
                {taskModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                        <div 
                            className="obel-task-modal obel-task-modal-animate text-slate-50"
                            onMouseDownCapture={handleModalMouseDown}
                        >
                            {/* Top bar */}
                            <div className="relative flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                                <button
                                    type="button"
                                    onClick={handleCreateTaskFromDraft}
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)]"
                                >
                                    ✓ Mark Complete
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteFromModal}
                                    className="absolute left-1/2 -translate-x-1/2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-rose-600 text-white text-sm shadow-[0_0_18px_rgba(248,113,113,0.85)] hover:bg-rose-500"
                                    title="Delete task"
                                >
                                    🗑
                                </button>
                                <div className="flex items-center gap-3 text-xs text-white">
                                    <button
                                        type="button"
                                        onClick={() => setTaskModalOpen(false)}
                                        className="hover:text-yellow-400"
                                    >
                                        Close ✕
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4 space-y-5">
                                {/* Title */}
                                <input
                                    className="w-full text-lg md:text-xl font-semibold rounded-xl bg-[#050814] border border-white/12 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                    placeholder="New Text..."
                                    value={taskDraft.title}
                                    onChange={(e) =>
                                        setTaskDraft((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                />

                                {/* Assignee / Due / Project row */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 relative">
                                        <button 
                                            type="button"
                                            onClick={() => avatarColorInputRef.current?.click()}
                                            className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-semibold shadow-[0_0_18px_rgba(0,0,0,0.6)]"
                                            style={{ 
                                                background: taskDraft.avatarColor || "#facc15" 
                                            }}
                                        >
                                            {taskDraft.assignee
                                                ? taskDraft.assignee
                                                    .split(" ")
                                                    .filter(Boolean)
                                                    .map((w) => w[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()
                                                : "JM"}
                                        </button>

                                        {/* Hidden native color picker */}
                                        <input
                                            ref={avatarColorInputRef}
                                            type="color"
                                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                            value={taskDraft.avatarColor || "facc15"}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({
                                                    ...prev,
                                                    avatarColor: e.target.value,
                                                }))
                                            }
                                        />
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wide text-white">
                                                Task Owner
                                            </p>
                                            <input
                                                className="border border-white/10 rounded-md bg-[#050814] text-sm px-2 py-1 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                                placeholder="Who's responsible?"
                                                value={taskDraft.assignee}
                                                onChange={(e) =>
                                                    setTaskDraft((prev) => ({ ...prev, assignee: e.target.value }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-white">
                                            Due date
                                        </p>
                                        <input
                                            className="border border-white/10 rounded-md bg-[#050814] text-sm px-2 py-1 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                            placeholder="e.g. Jul 14, 2025"
                                            value={taskDraft.dueRange}
                                            onChange={(e) => 
                                                setTaskDraft((prev) => ({ ...prev, dueRange: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-white">
                                            Project
                                        </p>
                                        <input
                                            className="border border-white/10 rounded-md bg-[#050814] text-sm px-2 py-1 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                            placeholder="e.g. Event Planning"
                                            value={taskDraft.project}
                                            onChange={(e) =>
                                                setTaskDraft((prev) => ({ ...prev, project: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Fields (Status + Priority) */}
                                <div className="border border-slate-200 rounded-xl overflow-visible text-sm">
                                    <div className="grid grid-cols-[120px_1fr] items-center px-4 py-3 border-b border-slate-200">
                                        <span className="text-white text-xs uppercase tracking-wide">
                                            Status
                                        </span>

                                        <div className="relative" ref={statusRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsStatusOpen((prev) => !prev)}
                                                className={`flex items-center justify-between w-40 rounded-full border border-slate-500/70 bg-[#050814] text-xs px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-sky-400 outline-none ${
                                                    STATUS_COLOR_CLASS[taskDraft.status]
                                                }`}
                                            >
                                                <span>
                                                    {
                                                        STATUS_OPTIONS.find(
                                                            (opt) => opt.value === taskDraft.status
                                                        )?.label
                                                    }
                                                </span>
                                                <span className="text-sky-300 text-[10px]">▾</span>
                                            </button>

                                            {isStatusOpen && (
                                                <div className="absolute top-full mb-2 left-0 w-40 rounded-md border border-slate-500 bg-[#020617] shadow-lg z-50">
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setTaskDraft((prev) => ({
                                                                    ...prev,
                                                                    status: opt.value,
                                                                }));
                                                                setIsStatusOpen(false);
                                                            }}
                                                            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 cursor-pointer ${
                                                                taskDraft.status === opt.value ? "bg-slate-900" : ""
                                                            }`}
                                                            style={{ color: STATUS_COLOR_MAP[opt.value] }}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] items-center px-4 py-3">
                                        <span className="text-white text-xs uppercase tracking-wide">
                                            Priority
                                        </span>

                                        <div className="relative" ref={priorityRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsPriorityOpen((prev) => !prev)}
                                                className={`flex w-40 items-center justify-between rounded-full border border-white/15 bg-[#050814] text-xs px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-sky-400 outline-none ${
                                                    taskDraft.priority === "High Priority"
                                                        ? "text-rose-300"
                                                        : taskDraft.priority === "Medium Priority"
                                                        ? "text-amber-300"
                                                        : "text-emerald-300"
                                                }`}
                                            >

                                                <span>{taskDraft.priority}</span>
                                                <span className="text-amber-300 text-[10px]">▾</span>
                                            </button>

                                            {isPriorityOpen && (
                                                <div className="absolute top-full mt-2 left-0 w-40 rounded-md border border-slate-500 bg-[#020617] shadow-lg z-50">
                                                    {PRIORITY_OPTIONS.map((opt) => (
                                                        <button 
                                                            key={opt} 
                                                            type="button"
                                                            onClick={() => {
                                                                setTaskDraft((prev) => ({
                                                                    ...prev,
                                                                    priority: opt,
                                                                }));
                                                                setIsPriorityOpen(false);
                                                            }}
                                                            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 cursor-pointer ${
                                                                taskDraft.priority === opt ? "bg-slate-900" : ""
                                                            }`}
                                                            style={{
                                                                color:
                                                                    opt === "High Priority"
                                                                        ? "#fb7185"
                                                                        : opt === "Medium Priority"
                                                                        ? "#facc15"
                                                                        : "#22c55e",
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-white mb-1">
                                        Description
                                    </p>
                                    <textarea
                                        rows={4}
                                        className="w-full border border-white/10 rounded-xl bg-[#050814] text-sm px-3 py-2 resize-none text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                        placeholder="e.g. Schedule and attend an appointment..."
                                        value={taskDraft.description}
                                        onChange={(e) =>
                                            setTaskDraft((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Comments */}
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-white mb-2">
                                        Comments
                                    </p>

                                    <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                                        {taskDraft.comments.map((c) => (
                                            <div key={c.id} className="text-xs">
                                                <p className="text-[10px] text-slate-400 mb-0.5">{c.timestamp}</p>
                                                <p className="text-slate-100">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <textarea
                                            rows={2}
                                            className="flex-1 border border-white/10 rounded-xl bg-[#050814] text-sm px-3 py-2 resize-none text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-sky-400/80"
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCommentToDraft}
                                            className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg hover:bg-indigo-400"
                                        >
                                            ⮞
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}



export default WorkspacePage;