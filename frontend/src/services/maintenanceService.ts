import { api } from '../lib/api';
import { PaginatedResponse } from '../types';

export interface MaintenanceSchedule {
  scheduleId: string;
  machineId: string;
  scheduleType: 'PREVENTIVE' | 'PREDICTIVE' | 'CORRECTIVE';
  frequency: string;
  nextMaintenanceDate: string;
  assignedEngineerId?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  workOrderId: string;
  machineId: string;
  scheduleId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  assignedEngineerId?: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const maintenanceService = {
  // Schedules
  async listSchedules(params?: {
    machineId?: string;
    status?: string;
    limit?: number;
  }): Promise<PaginatedResponse<MaintenanceSchedule>> {
    return api.get('/maintenance/schedules', params);
  },

  async createSchedule(data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    return api.post('/maintenance/schedules', data);
  },

  // Work Orders
  async listWorkOrders(params?: {
    machineId?: string;
    status?: string;
    priority?: string;
    limit?: number;
  }): Promise<PaginatedResponse<WorkOrder>> {
    return api.get('/maintenance/work-orders', params);
  },

  async getWorkOrder(workOrderId: string): Promise<WorkOrder> {
    return api.get(`/maintenance/work-orders/${workOrderId}`);
  },

  async createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
    return api.post('/maintenance/work-orders', data);
  },

  async updateWorkOrder(workOrderId: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
    return api.put(`/maintenance/work-orders/${workOrderId}`, data);
  },

  async deleteWorkOrder(workOrderId: string): Promise<{ message: string }> {
    return api.delete(`/maintenance/work-orders/${workOrderId}`);
  },
};
