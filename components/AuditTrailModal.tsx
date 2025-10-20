import React from 'react';
import type { Workflow } from '../types.ts';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle
} from './ui/Dialog.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table.tsx";

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose, workflow }) => {
  if (!isOpen || !workflow) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Audit Trail for {workflow.clientName}</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {workflow.auditTrail.length === 0 ? (
            <p className="text-muted-foreground text-center">No audit trail records found.</p>
          ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {[...workflow.auditTrail].reverse().map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{entry.activity}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{entry.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
