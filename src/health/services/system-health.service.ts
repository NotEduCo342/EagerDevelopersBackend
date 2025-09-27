import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import * as process from 'process';
import { SystemMetricsDto } from '../dto/health-response.dto';

@Injectable()
export class SystemHealthService {
  private readonly logger = new Logger(SystemHealthService.name);
  private startTime = Date.now();

  /**
   * Get comprehensive system performance metrics
   */
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      // Convert bytes to MB for readability
      const memoryStats = {
        used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((totalMemory / 1024 / 1024) * 100) / 100,
        percentage: Math.round((usedMemory / totalMemory * 100) * 100) / 100
      };

      // CPU usage calculation (simplified)
      const cpuStats = {
        user: Math.round((cpuUsage.user / 1000) * 100) / 100, // microseconds to milliseconds
        system: Math.round((cpuUsage.system / 1000) * 100) / 100,
        total: Math.round(((cpuUsage.user + cpuUsage.system) / 1000) * 100) / 100
      };

      this.logger.log(`System metrics collected - Memory: ${memoryStats.percentage}%, CPU: ${cpuStats.total}ms`);

      return {
        memory: memoryStats,
        cpu: cpuStats,
        nodeVersion: process.version,
        platform: os.platform()
      };
    } catch (error) {
      this.logger.error('Failed to collect system metrics', error.message);
      
      // Return fallback metrics
      return {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { user: 0, system: 0, total: 0 },
        nodeVersion: process.version || 'unknown',
        platform: os.platform() || 'unknown'
      };
    }
  }

  /**
   * Get system uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get detailed system information
   */
  getSystemInfo(): {
    hostname: string;
    architecture: string;
    cpuCount: number;
    loadAverage: number[];
  } {
    return {
      hostname: os.hostname(),
      architecture: os.arch(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg()
    };
  }

  /**
   * Check if system performance is healthy
   */
  isSystemHealthy(): boolean {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const memoryPercentage = (memoryUsage.heapUsed / totalMemory) * 100;
    
    // Consider system healthy if memory usage is below 80%
    return memoryPercentage < 80;
  }
}