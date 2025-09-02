import { CSDashboardRepository } from '../../repository/dashboard/cs-dashboard.repository';

export interface CSKPIData {
  newRequests: number;
  quotations: number;
  proposals: number;
  acceptedJobs: number;
}

export interface ShipmentAnalysisData {
  route: Array<{ route: string; count: number }>;
  transport: Array<{ transport: string; count: number }>;
  term: Array<{ term: string; count: number }>;
  groupWork: Array<{ groupWork: string; count: number }>;
  jobType: Array<{ jobType: string; count: number }>;
}

export interface PortAnalysisData {
  origin: Array<{ port: string; count: number }>;
  destination: Array<{ port: string; count: number }>;
}

export interface ProductTypeData {
  productTypes: Array<{ productType: string; count: number }>;
}

export interface CSStatusData {
  containerStatus: Array<{ status: string; count: number }>;
  documentStatus: Array<{ status: string; count: number }>;
  departureStatus: Array<{ status: string; count: number }>;
  deliveryStatus: Array<{ status: string; count: number }>;
}

export interface CSFiltersData {
  transports: string[];
  routes: string[];
  terms: string[];
}

export interface CSDateFilter {
  startDate?: string;
  endDate?: string;
}

export interface CSFilters extends CSDateFilter {
  transport?: string;
  route?: string;
  term?: string;
}

export class CSDashboardService {
  private repository: CSDashboardRepository;

  constructor() {
    this.repository = new CSDashboardRepository();
  }

  /**
   * Get CS Dashboard KPIs
   */
  async getCSKPIs(filters: CSFilters): Promise<CSKPIData> {
    try {
      const kpis = await this.repository.getCSKPIs(filters);
      return kpis;
    } catch (error) {
      console.error('Error fetching CS KPIs:', error);
      throw new Error('Failed to fetch CS KPIs');
    }
  }

  /**
   * Get Shipment Analysis Data
   */
  async getShipmentAnalysis(filters: CSFilters): Promise<ShipmentAnalysisData> {
    try {
      const shipmentData = await this.repository.getShipmentAnalysis(filters);
      
      console.log('Raw shipment data from repository:', shipmentData);
      
      // The repository already returns the correct structure
      return {
        route: shipmentData.routeAnalysis || [],
        transport: shipmentData.transportAnalysis || [],
        term: shipmentData.termAnalysis || [],
        groupWork: shipmentData.groupWorkAnalysis || [],
        jobType: shipmentData.jobTypeAnalysis || []
      };
    } catch (error) {
      console.error('Error fetching shipment analysis:', error);
      throw new Error('Failed to fetch shipment analysis');
    }
  }

  /**
   * Get Port Analysis Data
   */
  async getPortAnalysis(filters: CSFilters): Promise<PortAnalysisData> {
    try {
      const portData = await this.repository.getPortAnalysis(filters);
      
      console.log('Raw port data from repository:', portData);
      
      // The repository already returns the correct structure
      return {
        origin: portData.originPorts || [],
        destination: portData.destinationPorts || []
      };
    } catch (error) {
      console.error('Error fetching port analysis:', error);
      throw new Error('Failed to fetch port analysis');
    }
  }

  /**
   * Get Product Type Analysis Data
   */
  async getProductTypeAnalysis(filters: CSFilters): Promise<ProductTypeData> {
    try {
      const productTypes = await this.repository.getProductTypeAnalysis(filters);
      return { productTypes };
    } catch (error) {
      console.error('Error fetching product type analysis:', error);
      throw new Error('Failed to fetch product type analysis');
    }
  }

  /**
   * Get CS Status Tracking Data
   */
  async getCSStatusTracking(filters: CSFilters): Promise<CSStatusData> {
    try {
      const statusData = await this.repository.getCSStatusTracking(filters);
      
      return {
        containerStatus: statusData.containerStatus || [],
        documentStatus: statusData.documentStatus || [],
        departureStatus: statusData.departureStatus || [],
        deliveryStatus: statusData.deliveryStatus || []
      };
    } catch (error) {
      console.error('Error fetching CS status tracking:', error);
      throw new Error('Failed to fetch CS status tracking');
    }
  }

  /**
   * Get Available Filters
   */
  async getAvailableFilters(): Promise<CSFiltersData> {
    try {
      const filtersData = await this.repository.getAvailableFilters();
      
      return {
        transports: filtersData.transportOptions || [],
        routes: filtersData.routeOptions || [],
        terms: filtersData.termOptions || []
      };
    } catch (error) {
      console.error('Error fetching available filters:', error);
      throw new Error('Failed to fetch available filters');
    }
  }

  /**
   * Get Complete CS Dashboard Data
   */
  async getCompleteDashboardData(filters: CSFilters) {
    try {
      const [
        kpis,
        shipmentAnalysis,
        portAnalysis,
        productTypeAnalysis,
        statusTracking,
        availableFilters
      ] = await Promise.all([
        this.getCSKPIs(filters),
        this.getShipmentAnalysis(filters),
        this.getPortAnalysis(filters),
        this.getProductTypeAnalysis(filters),
        this.getCSStatusTracking(filters),
        this.getAvailableFilters()
      ]);

      return {
        kpis,
        shipmentAnalysis,
        portAnalysis,
        productTypeAnalysis,
        statusTracking,
        availableFilters,
        appliedFilters: filters
      };
    } catch (error) {
      console.error('Error fetching complete dashboard data:', error);
      throw new Error('Failed to fetch complete dashboard data');
    }
  }

  /**
   * Validate date filters
   */
  private validateDateFilters(filters: CSFilters): void {
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      if (startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }
    }
  }

  /**
   * Get CS Dashboard Data with validation
   */
  async getDashboardData(filters: CSFilters) {
    // Validate filters
    this.validateDateFilters(filters);

    // Get dashboard data
    return await this.getCompleteDashboardData(filters);
  }
}
