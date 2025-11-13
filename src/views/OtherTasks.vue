<template>
  <div class="p-4 pb-20">
    <h2 class="text-xl font-bold mb-4">{{ t('otherTasks.title') }}</h2>
    <div
      v-for="user in users"
      :key="user.name + user.avatar"
      class="bg-white rounded-xl shadow p-4 mb-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <img :src="user.avatar" class="w-10 h-10 rounded-full" alt="" />
        <div>
          <p class="font-bold">{{ user.name }}</p>
          <p class="text-sm text-gray-500">
            {{ t('otherTasks.taskSummary', { total: user.tasks, unassigned: user.unassigned }) }}
          </p>
        </div>
      </div>
      <span aria-hidden="true">⬇️</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const users = [
  { name: 'Alice Johnson', tasks: 2, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=1' },
  { name: 'Bob Smith', tasks: 3, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=2' },
  { name: 'Charlie Brown', tasks: 1, unassigned: 0, avatar: 'https://i.pravatar.cc/100?img=3' },
  { name: 'Alice Johnson', tasks: 2, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=1' },
  { name: 'Bob Smith', tasks: 3, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=2' },
  { name: 'Charlie Brown', tasks: 1, unassigned: 0, avatar: 'https://i.pravatar.cc/100?img=3' },
  { name: 'Alice Johnson', tasks: 2, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=1' },
  { name: 'Bob Smith', tasks: 3, unassigned: 1, avatar: 'https://i.pravatar.cc/100?img=2' },
  { name: 'Charlie Brown', tasks: 1, unassigned: 0, avatar: 'https://i.pravatar.cc/100?img=3' }
]
</script>
