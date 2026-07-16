<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12">
        <ecommerce-metrics :stats="stats" />
      </div>

      <div class="col-span-12 xl:col-span-7">
        <statistics-chart :chartData="stats.chartData" />
      </div>

      <div class="col-span-12 xl:col-span-5">
        <recent-orders :topEvents="stats.topEvents" />
      </div>
    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import StatisticsChart from '../components/ecommerce/StatisticsChart.vue'
import RecentOrders from '../components/ecommerce/RecentOrders.vue'
import api from '../services/api'

export default {
  components: {
    AdminLayout,
    EcommerceMetrics,
    StatisticsChart,
    RecentOrders,
  },
  name: 'Ecommerce',
  data() {
    return {
      stats: {
        totalRevenue: '$0',
        totalTickets: '0',
        activeEvents: '0',
        totalCustomers: '0',
        topEvents: [],
        chartData: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          tickets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      }
    }
  },
  async mounted() {
    try {
      const { data } = await api.get('/events/dashboard/stats')
      this.stats = data
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error)
    }
  }
}
</script>
