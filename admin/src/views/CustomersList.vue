<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Clientes">
      <template #action>
        <button class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Exportar CSV
        </button>
      </template>
    </PageBreadcrumb>

    <div class="space-y-5 sm:space-y-6">
      <CustomersTable />
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import CustomersTable from "@/components/tables/CustomersTable.vue";
</script>
