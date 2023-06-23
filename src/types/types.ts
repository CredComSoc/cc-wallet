export type WorkflowStates = "null" | "pending" | "validated" | "completed";
export type WorkflowTypes = "credit" | "bill";

export type CCTransaction = {
    entries: CCEntry[];
    state: WorkflowStates;
    type: WorkflowTypes;
    uuid: string;
    version: number;
    written: string;
};

export type CCEntry = {
    description: string;
    metadata: any;
    payer: string;
    payee: string;
    quant: number;
};

export interface FrontCCTransaction extends CCTransaction {
    totalAmountForUser: number;
    userRole: "payer" | "payee";
}

export interface FrontCCEntry extends CCEntry {
    quantForUser: number; // negative if payer
}
