import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
  Workflow,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { executeAutomationWorkflow, WORKFLOW_NODES, WorkflowNodeSpec } from '../services/mockAutomation';
import { AutomationLog } from '../types';

export const AutomationsPage: React.FC = () => {
  const {
    automationCards,
    automationLogs,
    toggleAutomationCard,
    recordAutomationRun,
    pushToast,
  } = useSupplyFlow();

  const [selectedNode, setSelectedNode] = useState<WorkflowNodeSpec>(WORKFLOW_NODES[0]);
  const [running, setRunning] = useState(false);
  const [activeNodeIdx, setActiveNodeIdx] = useState<number | null>(null);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [workflowCompletedMsg, setWorkflowCompletedMsg] = useState<string | null>(null);

  const [logStatusFilter, setLogStatusFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  const filteredLogs = useMemo(
    () =>
      logStatusFilter === 'All'
        ? automationLogs
        : automationLogs.filter((l) => l.status === logStatusFilter),
    [automationLogs, logStatusFilter]
  );

  const handleRunDemoWorkflow = async () => {
    if (running) return;
    setRunning(true);
    setCompletedIndices([]);
    setActiveNodeIdx(0);
    setWorkflowCompletedMsg(null);

    await executeAutomationWorkflow(
      (idx, node) => {
        setActiveNodeIdx(idx);
        setSelectedNode(node);
      },
      (idx) => {
        setCompletedIndices((prev) => [...prev, idx]);
      }
    );

    setActiveNodeIdx(null);
    setRunning(false);
    setWorkflowCompletedMsg('Product successfully prepared for review.');

    recordAutomationRun({
      workflowName: 'End-to-End n8n Intake Pipeline',
      trigger: 'Manual Demo Simulation • Jack',
      executionTime: '2026-11-10 09:48',
      status: 'Success',
      durationMs: 2810,
      processedProduct: 'Classic Linen Shirt (MF-204)',
      productId: 'prod-01',
      summary: 'Completed all 10 pipeline nodes from supplier intake to Approval Center staging.',
    });

    pushToast({
      title: 'Demo workflow completed',
      description: 'Product successfully prepared for review.',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Automation Center</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Visual n8n-oriented orchestration architecture connecting supplier intake, AI enrichment, pricing, and approval staging.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRunDemoWorkflow}
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white shadow-sf-xs hover:bg-[#293E31] disabled:opacity-60 transition-colors"
        >
          {running ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running Demo Workflow...
            </>
          ) : completedIndices.length === WORKFLOW_NODES.length ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Re-Run Demo Workflow
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Run Demo Workflow
            </>
          )}
        </button>
      </div>

      {/* Visual Workflow Builder + Node Detail Inspector */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6EAE4] pb-3.5">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Interactive Pipeline Architecture (10 Connected Nodes)
            </h2>
            <p className="text-xs text-[#78837C]">
              Click any node to inspect inputs, outputs, and failure handling—or run the simulated execution sequence.
            </p>
          </div>
          {workflowCompletedMsg && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9DBC9] bg-[#E9F0E9] px-3 py-1.5 text-xs font-medium text-[#344D3D]">
              <CheckCircle2 className="h-4 w-4" />
              <span>{workflowCompletedMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 10 Connected Nodes Grid */}
          <div className="lg:col-span-7 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WORKFLOW_NODES.map((node, idx) => {
                const isRunning = activeNodeIdx === idx;
                const isDone = completedIndices.includes(idx);
                const isSelected = selectedNode.id === node.id;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`relative flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      isRunning
                        ? 'border-[#B58A4B] bg-[#FAF3E6] shadow-sf-sm'
                        : isDone
                        ? 'border-[#526D5B] bg-[#E9F0E9]/60'
                        : isSelected
                        ? 'border-[#344D3D] bg-[#F7F8F5] shadow-sf-xs'
                        : 'border-[#E6EAE4] bg-[#F7F8F5] hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[#526D5B] tabular-nums">
                          {node.stepNumber}
                        </span>
                        <p className="text-xs font-semibold text-[#26352F] truncate">{node.title}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-[#78837C] line-clamp-2">
                        {node.shortDesc}
                      </p>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#B58A4B]" />
                      ) : isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-[#344D3D]" />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-[#CBD4CB]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Drawer Card */}
          <aside className="lg:col-span-5 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E6EAE4] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#526D5B]">
                  Node {selectedNode.stepNumber} Inspector
                </span>
                <h3 className="mt-0.5 font-display text-base font-semibold text-[#26352F]">
                  {selectedNode.title}
                </h3>
              </div>
              <span className="rounded-md bg-white border border-[#E6EAE4] px-2 py-0.5 text-[10px] font-medium text-[#78837C] tabular-nums">
                ~{selectedNode.sampleDurationMs}ms demo
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[#26352F]">What this step does</p>
                <p className="mt-0.5 leading-relaxed text-[#78837C]">{selectedNode.role}</p>
              </div>
              <div className="rounded-lg border border-[#E6EAE4] bg-white p-3">
                <p className="font-semibold text-[#26352F]">Receives</p>
                <p className="mt-0.5 text-[#78837C]">{selectedNode.receives}</p>
              </div>
              <div className="rounded-lg border border-[#E6EAE4] bg-white p-3">
                <p className="font-semibold text-[#344D3D]">Produces</p>
                <p className="mt-0.5 text-[#78837C]">{selectedNode.produces}</p>
              </div>
              <div className="rounded-lg border border-[#EBCAC7] bg-[#FBF0EF]/70 p-3">
                <p className="font-semibold text-[#9F514B]">If step fails</p>
                <p className="mt-0.5 text-[#78837C]">{selectedNode.failureHandling}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 8 Automation Overview Cards */}
      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold text-[#26352F]">
          Configured Automation Modules (Simulated Demo Metrics)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {automationCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs space-y-3 text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#26352F]">{card.name}</p>
                  <button
                    type="button"
                    onClick={() => toggleAutomationCard(card.id)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium border transition-colors ${
                      card.status === 'Active'
                        ? 'border-[#C9DBC9] bg-[#E9F0E9] text-[#344D3D]'
                        : 'border-[#E6EAE4] bg-[#F0F2ED] text-[#78837C]'
                    }`}
                  >
                    {card.status}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#78837C]">
                  {card.description}
                </p>
              </div>

              <div className="border-t border-[#E6EAE4] pt-2.5 grid grid-cols-2 gap-2 text-[11px] tabular-nums">
                <div>
                  <span className="text-[#9AA39C] block">Executions</span>
                  <span className="font-semibold text-[#26352F]">{card.executionCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#9AA39C] block">Success Rate</span>
                  <span className="font-semibold text-[#344D3D]">{card.successRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Automation Logs */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-[#26352F]">Automation Logs</h2>
          <div className="flex gap-1.5 text-xs">
            {['All', 'Success', 'Warning', 'Failed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setLogStatusFilter(st)}
                className={`rounded-lg border px-3 py-1 font-medium ${
                  logStatusFilter === st
                    ? 'border-[#344D3D] bg-[#E9F0E9] text-[#344D3D]'
                    : 'border-[#E6EAE4] bg-white text-[#78837C]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                <th className="pb-2.5 pr-3">Workflow Name</th>
                <th className="pb-2.5 px-3">Trigger</th>
                <th className="pb-2.5 px-3">Processed Product</th>
                <th className="pb-2.5 px-3">Execution Time</th>
                <th className="pb-2.5 px-3 text-right">Duration</th>
                <th className="pb-2.5 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="cursor-pointer hover:bg-[#F7F8F5]"
                >
                  <td className="py-3 pr-3 font-medium text-[#26352F]">{log.workflowName}</td>
                  <td className="py-3 px-3 text-[#78837C]">{log.trigger}</td>
                  <td className="py-3 px-3 text-[#26352F]">{log.processedProduct}</td>
                  <td className="py-3 px-3 tabular-nums text-[#78837C]">{log.executionTime}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#78837C]">{log.durationMs}ms</td>
                  <td className="py-3 pl-3 text-right">
                    <StatusBadge label={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Log Detail Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={selectedLog?.workflowName ?? 'Log Details'}
        subtitle={selectedLog?.trigger}
      >
        {selectedLog && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3">
              <span className="font-medium text-[#26352F]">{selectedLog.processedProduct}</span>
              <StatusBadge label={selectedLog.status} />
            </div>
            <p className="leading-relaxed text-[#78837C]">{selectedLog.summary}</p>
            <div className="flex justify-end gap-2 pt-2">
              {selectedLog.productId && (
                <Link
                  to={`/app/catalog/${selectedLog.productId}`}
                  className="rounded-lg border border-[#E6EAE4] px-3.5 py-2 font-medium text-[#26352F]"
                >
                  Open Product
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

