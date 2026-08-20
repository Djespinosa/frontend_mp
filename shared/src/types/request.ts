import { ApprovalStatus, RequestStatus } from './domain';

export interface CreateRequestApprover {
  name: string;
  email: string;
  role: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  amount: number;
  requester: { name: string };
  approvers: CreateRequestApprover[];
}

export interface CreateRequestApprovalSummary {
  approvalId: string;
  approverName: string;
  role: string;
  status: ApprovalStatus;
}

export interface CreateRequestResponse {
  requestId: string;
  status: RequestStatus;
  createdAt: string;
  approvals: CreateRequestApprovalSummary[];
}

export interface RequestSummary {
  requestId: string;
  title: string;
  amount: number;
  requesterName: string;
  createdAt: string;
  status: RequestStatus;
  signedCount: number;
}

export interface ListRequestsParams {
  limit?: number;
  cursor?: string;
}

export interface ListRequestsResponse {
  items: RequestSummary[];
  nextCursor: string | null;
}

export interface RequestDetailApprovalSummary {
  approvalId: string;
  approverName: string;
  role: string;
  status: ApprovalStatus;
  signedAt: string | null;
}

export interface RequestDetail {
  requestId: string;
  title: string;
  description: string;
  amount: number;
  requesterName: string;
  createdAt: string;
  status: RequestStatus;
  signedCount: number;
  pdfKey: string | null;
  completedAt: string | null;
  approvals: RequestDetailApprovalSummary[];
}
