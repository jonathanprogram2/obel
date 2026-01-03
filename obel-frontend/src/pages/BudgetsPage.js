import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    plugins,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";


ChartJS.register(ArcElement, Tooltip, Legend);

const seedBudgets = [
    {
        id: "housing",
        name: "Housing",
        amount: 1500,
        spent: 1200,
        items: [
            { id: "mortgage", name: "Mortgage", planned: 1000, spent: 1000 },
            { id: "water", name: "Water", planned: 100, spent: 80 },
            { id: "electric", name: "Electricity", planned: 150, spent: 120 },
            { id: "other-housing", name: "Other", planned: 250, spent: 0 },
        ],
    },
    {
        id: "food",
        name: "Food",
        amount: 500,
        spent: 320,
        items: [
            { id: "groceries", name: "Groceries", planned: 350, spent: 260 },
            { id: "dining", name: "Dining out", planned: 150, spent: 60 },
        ],
    },
    {
        id: "transport",
        name: "Transportation",
        amount: 400,
        spent: 260,
        items: [
            { id: "gas", name: "Gas", planned: 200, spent: 160 },
            { id: "uber", name: "Rides / Uber", planned: 200, spent: 100 },
        ],
    },
];

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState(seedBudgets);
    const [newCategory, setNewCategory] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [activeBudgetId, setActiveBudgetId] = useState(null);
    const [showPageHelp, setShowPageHelp] = useState(false);

    const activeBudget = useMemo(
        () => budgets.find((b) => b.id === activeBudgetId) || null,
        [budgets, activeBudgetId]
    );

    // ---- rollups for top cards -----
    const { totalPlanned, totalSpent, totalBalance } = useMemo(() => {
        const planned = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
        const spent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
        return {
            totalPlanned: planned,
            totalSpent: spent,
            totalBalance: planned - spent,
        };
    }, [budgets]);

    // ----- chart data -------
    const chartData = useMemo(() => {
        if (!budgets.length) {
            return {
                labels: ["No budgets yet"],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ["rgba(148,163,184,0.6)"],
                        borderWidth: 0,
                    },
                ],
            };
        }

        return {
            labels: budgets.map((b) => b.name),
            datasets: [
                {
                    data: budgets.map((b) => (b.spent || 0) || 0.0001),
                    backgroundColor: [
                        "#facc15",
                        "#22d3ee",
                        "#4ade80",
                        "#818cf8",
                        "#fb7185",
                        "#38bdf8",
                        "#f97316",
                    ],
                    borderWidth: 0,
                },
            ],
        };
    }, [budgets]);

    const chartOptions = {
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    color: "#e5e7eb",
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: "#020617",
                borderColor: "rgba(250,204,21,0.6)",
                borderWidth: 1,
                padding: 8,
                cornerRadius: 8,
                callbacks: {
                    title: (items) => items[0]?.label ?? "",
                    label: (context) => {
                        const value = context.parsed;
                        if (typeof value !== "number" || Number.isNaN(value)) return "";
                        return `$${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`
                    },
                },
            },
        },
        cutout: "60%",
    };

    // ---- handlers -------
    const handleAddBudget = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(newAmount);
        if (!newCategory.trim() || !amountNum || amountNum <= 0) return;

        const id = `${newCategory.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

        setBudgets((prev) => [
            ...prev,
            {
                id,
                name: newCategory.trim(),
                amount: amountNum,
                spent: 0,
                items: [],
            },
        ]);

        setNewCategory("");
        setNewAmount("");
    };

    const handleDeleteBudget = (id) => {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
    };

    const recalcBudgetTotalsFromItems = (items) => {
        const amount = items.reduce((sum, it) => sum + (Number(it.planned) || 0), 0);
        const spent = items.reduce((sum, it) => sum + (Number(it.spent) || 0), 0);
        return { amount, spent};
    };

    const updateBudgetItems = (budgetId, nextItems) => {
        setBudgets((prev) =>
            prev.map((b) => {
                if (b.id !== budgetId) return b;
                const { amount, spent } = recalcBudgetTotalsFromItems(nextItems);
                return { ...b, amount, spent, items: nextItems };
            })
        );
    };

    const handleAddItem = (budgetId) => {
        if (!activeBudget) return;
        const newItem = {
            id: `item-${Date.now()}`,
            name: "",
            planned: 0,
            spent: 0,
        };
        const nextItems = [...(activeBudget.items || []), newItem];
        updateBudgetItems(budgetId, nextItems);
    };

    const handleItemFieldChange = (budgetId, itemId, field, value) => {
        const budget = budgets.find((b) => b.id === budgetId);
        if (!budget) return;

        const nextItems = (budget.items || []).map((it) =>
            it.id === itemId ? { ...it, [field]: field === "name" ? value : Number(value) } : it
        );

        updateBudgetItems(budgetId, nextItems);
    };

    const handleRemoveItem = (budgetId, itemId) => {
        const budget = budgets.find((b) => b.id === budgetId);
        if (!budget) return;

        const nextItems = (budget.items || []).filter((it) => it.id !== itemId);
        updateBudgetItems(budgetId, nextItems);
    };

    // ----- UI helpers -----------
    const formatMoney = (v) =>
        typeof v === "number" && !Number.isNaN(v)
            ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "--";

    return (
        <div className="min-h-screen bg-[#050507] text-white pt-20 pb-10 px-6 md:px-10 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex items-start justify-between gap-4"
            >
                <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.2em] text-yellow-400/80 mb-1">
                        Budgets
                    </p>
                    <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-2">
                        My Budgets & Cash Flow
                    </h1>
                    <p className="text-sm text-gray-400 max-w-xl">
                        Build simple budget "buckets" for housing, food, and more. Each box
                        can be opened to track detailed line items like mortgage, groceries,
                        or gas.
                    </p>
                </div>

                {/* page help trigger */}
                <button
                    type="button"
                    onClick={() => setShowPageHelp(true)}
                    className="text-[0.7rem] md:text-xs text-yellow-300 hover:text-yellow-100 underline decoration-dotted underline-offset-4 mt-1"
                >
                    What is this page?
                </button>
            </motion.div>

            {/* Top summary cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                {/* Total Balance (planned - spent) */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-black via-[#101018] to-black p-5 shadow-[0_0_30px_rgba(234,179,8,0.35)]"
                >
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-1">
                        Total Balance
                    </p>
                    <p className="text-3xl md:text-4xl font-semibold">
                        {formatMoney(totalBalance)}
                    </p>
                    <p className="text-[0.7rem] text-gray-500 mt-3">
                        Planned minus spent across all budget categories.
                    </p>
                </motion.div>

                {/* Total planned (acts like "Income assigned") */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg"
                >
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-1">
                        Planned (Budgets)
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-emerald-300">
                        {formatMoney(totalPlanned)}
                    </p>
                    <p className="text-[0.7rem] text-gray-500 mt-3">
                        Sum of all budget amounts you've assigned.
                    </p>
                </motion.div>

                {/* Total spent */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                    className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg"
                >
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-1">
                        Spent so far
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-rose-300">
                        {formatMoney(totalSpent)}
                    </p>
                    <p className="text-[0.7rem] text-gray-500 mt-3">
                        Total spent across all categories based on your line items.
                    </p>
                </motion.div>
            </div>

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                            Budget allocation
                        </p>
                        <p className="text-[0.7rem] text-gray-500">
                            How your spending is distributed across categories.
                        </p>
                    </div>
                </div>
                <div className="max-w-md mx-auto">
                    <Doughnut data={chartData} options={chartOptions} />
                </div>
            </motion.div>

            {/*Add Budget form */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg mb-8"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-manrope font-semibold">
                        Add a new budget
                    </h2>
                    <p className="text-[0.7rem] text-gray-500">
                        Think: Housing, Food, Transportation, Entertainment, etc.
                    </p>
                </div>

                <form
                    onSubmit={handleAddBudget}
                    className="grid gap-4 md:grid-cols-[2fr,1fr,auto]"
                >
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Category name</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                            placeholder="e.g. Housing"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Planned amount ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                            placeholder="e.g. 1500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto rounded-full bg-yellow-400 text-black text-sm font-semibold px-5 py-2 hover:bg-yellow-300 transition shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                        >
                            Add budget
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Budget list */}
            <div className="grid gap-4 md:grid-cols-2">
                {budgets.map((b) => {
                    const percent =
                        b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
                    return (
                        <motion.div
                            key={b.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg relative"
                        >
                            <button
                                type="button"
                                onClick={() => handleDeleteBudget(b.id)}
                                className="absolute top-2 right-3 h-7 w-7 flex items-center justify-center
                                            rounded-full border border-red-500/70 text-xs text-red-200
                                            bg-black/80 hover:bg-red-500/80 hover:text-black
                                            shadow-[0_0_12px_rgba(248,113,113,0.6)]" 
                                aria-label={`Delete ${b.name} budget`}  
                            >
                                ✕
                            </button>

                            {/* Open details modal */}
                            <button
                                type="button"
                                onClick={() => setActiveBudgetId(b.id)}
                                className="absolute top-2 left-1/2 -translate-x-1/2 h-8 w-8 flex items-center justify-center rounded-full border border-yellow-400/80 text-[0.75rem] text-yellow-200 bg-black/80 hover:bg-yellow-300 hover:text-black shadow-[0_0_16px_rgba(250,204,21,0.7)]"
                                aria-label="Open budget details"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="2" d="m18 15l-6-6l-6 6"/></svg>
                            </button>

                            <div className="mt-6 flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="text-base font-semibold font-manrope">
                                        {b.name}
                                    </h3>
                                    <p className="text-[0.7rem] text-gray-500">
                                        {formatMoney(b.spent)} spent of{" "}
                                        <span className="text-yellow-300">
                                            {formatMoney(b.amount)}
                                        </span>
                                    </p>
                                </div>

                                
                            </div>

                            <div className="mt-3">
                                <div className="flex justify-between text-[0.7rem] text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span>{percent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-black/70 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 transition-all duration-300"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Details modal */}
            {activeBudget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setActiveBudgetId(null)}
                >
                    <div
                        className="max-w-2xl w-full rounded-2xl border border-yellow-500/60 bg-[#050509] p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                    {activeBudget.name} budget details
                                </h2>
                                <p className="text-[0.7rem] text-gray-400">
                                    Add line items like mortgage, water, or electricity. Each row
                                    rolls into this budget and into the chart + summary cards.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveBudgetId(null)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-[320px] pr-2">
                            <table className="w-full text-xs md:text-sm">
                                <thead className="border-b border-yellow-500/20 text-gray-400">
                                    <tr>
                                        <th className="py-2 text-left font-normal">Item</th>
                                        <th className="py-2 text-right font-normal">Planned ($)</th>
                                        <th className="py-2 text-right font-normal">Spent ($)</th>
                                        <th className="py-2 text-right font-normal"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-yellow-500/10">
                                    {(activeBudget.items || []).map((it) => (
                                        <tr key={it.id}>
                                            <td className="py-2 pr-2">
                                                <input
                                                    type="text"
                                                    value={it.name}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(
                                                            activeBudget.id,
                                                            it.id,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg bg-black/60 border border-yellow-500/40 px-2 py-1 text-xs outline-none focus:border-yellow-300"
                                                    placeholder="e.g. Mortgage"
                                                />
                                            </td>
                                            <td className="py-2 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={it.planned}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(
                                                            activeBudget.id,
                                                            it.id,
                                                            "planned",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg bg-black/60 border border-yellow-500/40 px-2 py-1 text-xs text-right outline-none focus:border-yellow-300"
                                                />
                                            </td>
                                            <td className="py-2 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={it.spent}
                                                    onChange={(e) =>
                                                        handleItemFieldChange(
                                                            activeBudget.id,
                                                            it.id,
                                                            "spent",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg bg-black/60 border border-yellow-500/40 px-2 py-1 text-xs text-right outline-none focus:border-yellow-300"
                                                />
                                            </td>
                                            <td className="py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(activeBudget.id, it.id)
                                                    }
                                                    className="text-[0.7rem] text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {(!activeBudget.items || activeBudget.items.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-4 text-[0.75rem] text-gray-500 text-center"
                                            >
                                                No line items yet. Add your first one below.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-yellow-500/20 pt-3">
                            <div className="text-[0.7rem] text-gray-400">
                                <p>
                                    <span className="text-gray-300">Planned:</span>{" "}
                                    <span className="text-emerald-300">
                                        {formatMoney(activeBudget.amount)}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-300">Spent:</span>{" "}
                                    <span className="text-rose-300">
                                        {formatMoney(activeBudget.spent)}
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleAddItem(activeBudget.id)}
                                    className="px-4 py-1.5 rounded-full bg-yellow-400 text-xs font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                                >
                                    + Add item
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveBudgetId(null)}
                                    className="px-4 py-1.5 rounded-full bg-black border border-yellow-500/40 text-xs font-semibold text-gray-200 hover:border-yellow-300"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* what is this page? modal */}
            {showPageHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 md:px-4"
                    onClick={() => setShowPageHelp(false)}
                >
                    <div
                        className="w-[92vw] max-w-3xl rounded-3xl border border-yellow-500/70 bg-gradient-to-br from-black via-[#080812] to-black p-6 md:p-8 shadow-[0_0_55px_rgba(234,179,8,0.7)] relative max-h-[82vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                How this Budgets page works
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowPageHelp(false)}
                                className="text-xs md:text-sm text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        {/* Body copy */}
                        <div className="space-y-4 md:space-y-5 text-sm md:text-base leading-relaxed text-gray-100">
                            <p>
                                This screen is your{" "}
                                <span className="text-yellow-300 font-semibold">
                                    budget management hub
                                </span>
                                . It helps you see how your money is planned and where it's 
                                actually going over time.
                            </p>

                            {/* Top cards */}
                            <div>
                                <h3 className="text-xs md:text-sm uppercase tracking-[0.16em] text-yellow-300 mb-2">
                                    1. Top summary cards
                                </h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-200">
                                    <li>
                                        <span className="font-semibold text-gray-50">
                                            Total balance
                                        </span>{" "}
                                        = planned budgets minus everything you've marked as
                                        spent.
                                    </li>
                                    <li>
                                        <span className="font-semibold text-gray-50">
                                            Planned (budgets)
                                        </span>{" "}
                                        shows the sum of all category budget amounts.
                                    </li>
                                    <li>
                                        <span className="font-semibold text-gray-50">
                                            Spent so far
                                        </span>{" "}
                                        rolls up the spent amounts from every line item in
                                        your budgets.
                                    </li>
                                </ul>
                            </div>

                            {/* Donut chart + arrow icon row */}
                            <div className="grid gap-3 md:grid-cols-2">
                                {/* Donut / allocation */}
                                <div>
                                    <h3 className="text-xs md:text-sm uppercase tracking-[0.16em] text-yellow-300 mb-2">
                                        2. Budget allocation chart
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        {/* Donut icon */}
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 border border-yellow-400/80 shadow-[0_0_18px_rgba(234,179,8,0.6)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="#fff" d="M0 7.5A7.5 7.5 0 0 1 7 .016v4.02a3.5 3.5 0 1 0 2.596 6.267l2.842 2.842A7.5 7.5 0 0 1 0 7.5" stroke-width="0.5" stroke="#fff"/><path fill="#fff" d="M13.145 12.438A7.47 7.47 0 0 0 15 7.5c0-1.034-.21-2.018-.587-2.914L10.755 6.21a3.5 3.5 0 0 1-.452 3.385zM8 4.035V.016a7.5 7.5 0 0 1 5.963 3.676L10.254 5.34A3.5 3.5 0 0 0 8 4.035" stroke-width="0.5" stroke="#fff"/></svg>
                                        </div>
                                        <p className="text-gray-200 text-sm md:text-base">
                                            The donut chart shows{" "}
                                            <span className="font-semibold">
                                                how your spending is distributed
                                            </span>{" "}
                                            across categories. Each slice is one budget
                                            (Housing, Food, Transportation, etc.). Hover a 
                                            slice to see the exact dollar amount you've
                                            spent there.
                                        </p>
                                    </div>
                                </div>

                                {/* Detail view icon */}
                                <div>
                                    <h3 className="text-xs md:text-sm uppercase tracking-[0.16em] text-yellow-300 mb-2">
                                        3. Budget detail view
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        {/* Up-arrow icon */}
                                        <button
                                            type="button"
                                            disabled
                                            className="mt-1 h-9 w-9 flex items-center justify-center rounded-full border border-yellow-400/80 bg-black/80 shadow-[0_0_16px_rgba(250,204,21,0.7)]"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    fill="none"
                                                    stroke="#fefce8"
                                                    strokeWidth="2"
                                                    d="m18 15l-6-6l-6 6"
                                                />
                                            </svg>
                                        </button>
                                        <p className="text-gray-200 text-sm md:text-base">
                                            Each budget card has a{" "}
                                            <span className="font-semibold">
                                                glowing up-arrow icon
                                            </span>{" "}
                                            centered at the top. Click it to open that
                                            budget's detail modal, where you can break the
                                            category into line items (for example, a Housing
                                            budget with mortgage, water, electricity, and
                                            internet). Each line gets its own{" "}
                                            <span className="font-semibold">
                                                planned
                                            </span>{" "}
                                            and {" "}
                                            <span className="font-semibold">spent</span>{" "}
                                            amounts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Budget cards section */}
                            <div>
                                <h3 className="text-xs md:text-sm uppercase tracking-[0.16em] text-yellow-300 mb-2">
                                    4. Budget cards & progress bars
                                </h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-200">
                                    <li>
                                        Use <span className="font-semibold">"Add a new
                                        budget"</span> to create a category like Housing,
                                        Food, or Subscriptions and give it a planned
                                        amount.
                                    </li>
                                    <li>
                                        Each card shows{" "}
                                        <span className="font-semibold">
                                            how much you've spent vs. planned
                                        </span>{" "}
                                        plus a progress bar, so you can see how close you
                                        are to the limit.
                                    </li>
                                    <li>
                                        Updating line items in the detail view automatically{" "}
                                        <span className="font-semibold">
                                            updates the budget card, the donut chart, and
                                            the summary totals at the top.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Planning-only note */}
                            <p className="text-xs md:text-sm text-gray-400 border-t border-yellow-500/25 pt-4">
                                This is a{" "}
                                <span className="text-yellow-200 font-semibold">
                                    planning tool only
                                </span>  
                                . It doesn't move real money — it mirrors how you're
                                managing cash flow so you can experiment, adjust, and keep
                                your spending aligned with your goals.                
                            </p>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowPageHelp(false)}
                                className="px-5 py-2 rounded-full bg-yellow-400 text-xs md:text-sm font-semibold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.7)]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsPage;