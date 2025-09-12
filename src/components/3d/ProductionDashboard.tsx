import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 生产数据接口
interface ProductionData {
  totalProduction: number;
  todayProduction: number;
  efficiency: number;
  qualityRate: number;
  activeDevices: number;
  totalDevices: number;
  alerts: Alert[];
  deviceStatus: DeviceStatus[];
  productionTrend: ProductionTrendData[];
  qualityTrend: QualityTrendData[];
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  device?: string;
}

interface DeviceStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'maintenance' | 'error';
  efficiency: number;
  temperature: number;
  pressure: number;
  lastMaintenance: string;
}

interface ProductionTrendData {
  time: string;
  production: number;
  target: number;
}

interface QualityTrendData {
  time: string;
  qualityRate: number;
  defectRate: number;
}

// 实时数据生成器
const generateMockData = (): ProductionData => {
  const now = new Date();
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      message: '设备A温度偏高，建议检查冷却系统',
      timestamp: new Date(now.getTime() - 5 * 60000).toLocaleTimeString(),
      device: '生产线A'
    },
    {
      id: '2',
      type: 'info',
      message: '生产线B完成今日目标产量',
      timestamp: new Date(now.getTime() - 15 * 60000).toLocaleTimeString(),
      device: '生产线B'
    },
    {
      id: '3',
      type: 'error',
      message: '质检设备C需要校准',
      timestamp: new Date(now.getTime() - 30 * 60000).toLocaleTimeString(),
      device: '质检线C'
    },
    {
      id: '4',
      type: 'warning',
      message: '生产线D运行效率低于标准值',
      timestamp: new Date(now.getTime() - 45 * 60000).toLocaleTimeString(),
      device: '生产线D'
    },
    {
      id: '5',
      type: 'info',
      message: '原料库存充足，无需补充',
      timestamp: new Date(now.getTime() - 60 * 60000).toLocaleTimeString(),
      device: '仓储系统'
    },
    {
      id: '6',
      type: 'error',
      message: '传送带E出现异常，需要维修',
      timestamp: new Date(now.getTime() - 75 * 60000).toLocaleTimeString(),
      device: '传送带E'
    },
    {
      id: '7',
      type: 'warning',
      message: '包装机F包装速度下降',
      timestamp: new Date(now.getTime() - 90 * 60000).toLocaleTimeString(),
      device: '包装线F'
    },
    {
      id: '8',
      type: 'info',
      message: '夜班交接完成，设备状态正常',
      timestamp: new Date(now.getTime() - 105 * 60000).toLocaleTimeString(),
      device: '控制中心'
    }
  ];

  const deviceStatus: DeviceStatus[] = [
    {
      id: 'line-a',
      name: '生产线A',
      status: 'running',
      efficiency: 92,
      temperature: 75,
      pressure: 2.3,
      lastMaintenance: '2024-01-15'
    },
    {
      id: 'line-b',
      name: '生产线B',
      status: 'running',
      efficiency: 88,
      temperature: 68,
      pressure: 2.1,
      lastMaintenance: '2024-01-12'
    },
    {
      id: 'line-c',
      name: '生产线C',
      status: 'maintenance',
      efficiency: 0,
      temperature: 25,
      pressure: 0,
      lastMaintenance: '2024-01-20'
    },
    {
      id: 'qc-a',
      name: '质检线A',
      status: 'running',
      efficiency: 95,
      temperature: 22,
      pressure: 1.0,
      lastMaintenance: '2024-01-18'
    }
  ];

  const productionTrend: ProductionTrendData[] = [];
  const qualityTrend: QualityTrendData[] = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60000);
    productionTrend.push({
      time: time.getHours().toString().padStart(2, '0') + ':00',
      production: Math.floor(Math.random() * 50) + 80,
      target: 100
    });
    
    qualityTrend.push({
      time: time.getHours().toString().padStart(2, '0') + ':00',
      qualityRate: Math.random() * 5 + 95,
      defectRate: Math.random() * 2 + 1
    });
  }

  return {
    totalProduction: 15420,
    todayProduction: 2180,
    efficiency: 89.5,
    qualityRate: 97.2,
    activeDevices: 3,
    totalDevices: 4,
    alerts,
    deviceStatus,
    productionTrend,
    qualityTrend
  };
};

// KPI卡片组件
interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, trend, trendValue, color, icon }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl opacity-80">{icon}</div>
        {trend && (
          <div className="flex items-center text-sm">
            {getTrendIcon()}
            <span className="ml-1">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">
        {value}{unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
      <div className="text-sm opacity-80">{title}</div>
    </motion.div>
  );
};

// 设备状态组件
interface DeviceStatusCardProps {
  device: DeviceStatus;
}

const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ device }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'idle': return '空闲';
      case 'maintenance': return '维护中';
      case 'error': return '故障';
      default: return '未知';
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg p-4 shadow-md border border-gray-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{device.name}</h4>
        <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(device.status)}`}>
          {getStatusText(device.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">效率:</span>
          <span className="ml-1 font-medium">{device.efficiency}%</span>
        </div>
        <div>
          <span className="text-gray-500">温度:</span>
          <span className="ml-1 font-medium">{device.temperature}°C</span>
        </div>
        <div>
          <span className="text-gray-500">压力:</span>
          <span className="ml-1 font-medium">{device.pressure} MPa</span>
        </div>
        <div>
          <span className="text-gray-500">维护:</span>
          <span className="ml-1 font-medium">{device.lastMaintenance}</span>
        </div>
      </div>
    </motion.div>
  );
};

// 趋势图组件
interface TrendChartProps {
  title: string;
  data: any[];
  color: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ title, data, color }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.production || d.qualityRate || 0, d.target || d.defectRate || 0)));
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-40 flex items-end justify-between">
        {data.slice(-12).map((item, index) => {
          const height1 = ((item.production || item.qualityRate) / maxValue) * 100;
          const height2 = ((item.target || item.defectRate) / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="flex items-end h-32 w-full">
                <motion.div
                  className={`${color} rounded-t mr-1 flex-1`}
                  style={{ height: `${height1}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height1}%` }}
                  transition={{ delay: index * 0.1 }}
                />
                {item.target !== undefined && (
                  <motion.div
                    className="bg-gray-300 rounded-t flex-1"
                    style={{ height: `${height2}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height2}%` }}
                    transition={{ delay: index * 0.1 }}
                  />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 警报列表组件
interface AlertListProps {
  alerts: Alert[];
}

const AlertList: React.FC<AlertListProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">实时警报</h3>
      <div 
        className="space-y-3 max-h-80 overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}
      >
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start">
                <span className="text-lg mr-2">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{alert.device}</span>
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 主生产大屏组件
const ProductionDashboard: React.FC = () => {
  const [data, setData] = useState<ProductionData>(generateMockData());
  const [currentTime, setCurrentTime] = useState(new Date());

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setCurrentTime(new Date());
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, []);

  // 时间更新
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">生产车间监控大屏</h1>
          <p className="text-blue-200">实时监控生产状态 · 智能制造管理系统</p>
        </div>
        <div className="text-right text-white">
          <div className="text-2xl font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-blue-200">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* KPI指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="今日产量"
          value={data.todayProduction}
          unit="件"
          trend="up"
          trendValue="+12%"
          color="from-blue-500 to-blue-600"
          icon="📊"
        />
        <KPICard
          title="生产效率"
          value={data.efficiency}
          unit="%"
          trend="up"
          trendValue="+2.3%"
          color="from-green-500 to-green-600"
          icon="⚡"
        />
        <KPICard
          title="质量合格率"
          value={data.qualityRate}
          unit="%"
          trend="stable"
          trendValue="0.1%"
          color="from-purple-500 to-purple-600"
          icon="✅"
        />
        <KPICard
          title="设备运行率"
          value={`${data.activeDevices}/${data.totalDevices}`}
          trend="down"
          trendValue="-1台"
          color="from-orange-500 to-orange-600"
          icon="🏭"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 生产趋势图 */}
        <div className="lg:col-span-2">
          <TrendChart
            title="24小时生产趋势"
            data={data.productionTrend}
            color="bg-blue-500"
          />
        </div>
        
        {/* 实时警报 */}
        <div>
          <AlertList alerts={data.alerts} />
        </div>
      </div>

      {/* 设备状态和质量趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 设备状态 */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">设备状态监控</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.deviceStatus.map((device) => (
              <DeviceStatusCard key={device.id} device={device} />
            ))}
          </div>
        </div>
        
        {/* 质量趋势 */}
        <div>
          <TrendChart
            title="质量趋势分析"
            data={data.qualityTrend}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="mt-8 bg-black bg-opacity-30 rounded-lg p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>系统正常运行</span>
            </div>
            <div className="text-sm text-blue-200">
              累计产量: {data.totalProduction.toLocaleString()} 件
            </div>
          </div>
          <div className="text-sm text-blue-200">
            数据更新时间: {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;