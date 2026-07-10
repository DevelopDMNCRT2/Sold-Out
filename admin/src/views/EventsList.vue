<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle">
      <template #action>
        <button @click="router.push('/eventos/nuevo')" class="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors font-medium text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo
        </button>
      </template>
    </PageBreadcrumb>
    
    <div class="space-y-5 sm:space-y-6">
      <EventsTable ref="eventsTableRef" />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import EventsTable from "@/components/tables/EventsTable.vue";

const currentPageTitle = ref("Eventos");
const eventsTableRef = ref(null);
const router = useRouter();
</script>
