import React from 'react';
import type { Workflow } from '../types.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/Dialog.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table.tsx";
import { Button } from './ui/Button.tsx';
import { PrinterIcon } from './icons/PrinterIcon.tsx';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, workflow }) => {
  if (!isOpen || !workflow) {
    return null;
  }

  const subtotal = workflow.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxesAndFees = workflow.amount - subtotal;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice #{workflow.externalId}</DialogTitle>
          <DialogDescription>
            Billed to: {workflow.clientName}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                    <p className="font-semibold text-foreground">FazeAR Inc.</p>
                    <p className="text-muted-foreground">123 Automation Lane</p>
                    <p className="text-muted-foreground">Collections City, 12345</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold text-foreground">Date Created:</span> {new Date(workflow.createdDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold text-foreground">Date Due:</span> {new Date(workflow.dueDate).toLocaleDateString()}</p>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Description</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workflow.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-mono">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right font-mono">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Subtotal</TableCell>
                        <TableCell className="text-right font-mono">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                    {taxesAndFees > 0 && (
                         <TableRow>
                            <TableCell colSpan={3} className="text-right font-semibold">Taxes & Fees</TableCell>
                            <TableCell className="text-right font-mono">${taxesAndFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                    )}
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold text-lg">Total Due</TableCell>
                        <TableCell className="text-right font-bold font-mono text-lg">${workflow.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
                <PrinterIcon className="w-4 h-4 mr-2"/>
                Print
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
