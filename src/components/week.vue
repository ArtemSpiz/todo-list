<script setup>
import { ref, computed, watch, onMounted, defineEmits } from 'vue'

const emit = defineEmits(['sendTasks'])

const newTask = ref('')
const hideCompleted = ref(false)
const selectedDate = ref(
	localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0]
)
const tasks = ref(JSON.parse(localStorage.getItem('tasksByDate')) || {})
const newTaskPriority = ref(2)

//computed
const filterTasks = computed(() => {
	return hideCompleted.value
		? tasks.value[selectedDate.value]?.filter(t => !t.done) || []
		: sortTasks(tasks.value[selectedDate.value] || [])
})

const hasCompletedTask = computed(() => {
	return tasks.value[selectedDate.value]?.some(t => t.done)
})

const datesWithTasks = computed(() => {
	return Object.keys(tasks.value)
		.map(date => ({
			date,
			taskCount: tasks.value[date].length,
		}))
		.filter(dateInfo => dateInfo.taskCount > 0)
})

//methods
const addTask = () => {
	if (!newTask.value.trim()) {
		alert('The task cannot be empty!')
		return
	}

	if (!tasks.value[selectedDate.value]) {
		tasks.value[selectedDate.value] = []
	}

	tasks.value[selectedDate.value].push({
		id: Date.now(),
		text: newTask.value,
		priority: newTaskPriority.value,
		done: false,
		subtasks: [],
		showSubtaskInput: false,
	})

	newTask.value = ''
	newTaskPriority.value = 2
	saveTasks()
}

const addSubtask = task => {
	if (!task.newSubtask.trim()) {
		alert('The subtask cannot be empty!')
		return
	}

	task.subtasks.push({
		text: task.newSubtask,
		done: false,
	})

	task.newSubtask = ''
	task.showSubtaskInput = false
	saveTasks()
}

const removeSubtask = (task, subtask) => {
	task.subtasks = task.subtasks.filter(st => st !== subtask)
	saveTasks()
}

const removeTask = task => {
	tasks.value[selectedDate.value] = tasks.value[selectedDate.value].filter(
		t => t !== task
	)
	saveTasks()
}

const deleteAll = () => {
	tasks.value[selectedDate.value] = []
	saveTasks()
}

const sortTasks = tasksList => {
	return tasksList.sort((a, b) => {
		if (a.done !== b.done) {
			return a.done - b.done
		}
		return a.priority - b.priority
	})
}

const saveTasks = () => {
	localStorage.setItem('tasksByDate', JSON.stringify(tasks.value))
}

const saveSelectedDate = () => {
	localStorage.setItem('selectedDate', selectedDate.value)
}

watch(tasks, saveTasks, { deep: true })

watch(selectedDate, saveSelectedDate)

onMounted(() => {
	selectedDate.value =
		localStorage.getItem('selectedDate') ||
		new Date().toISOString().split('T')[0]
	tasks.value = JSON.parse(localStorage.getItem('tasksByDate')) || {}
})

const sendAllTasks = () => {
	emit('sendTasks', tasks.value)
}
</script>

<template>
	<main
		class="flex flex-col justify-center items-center bg-zinc-700 p-4 sm:p-6 lg:p-20 rounded-lg shadow-2xl shadow-black w-full max-w-lg lg:max-w-4xl"
	>
		<div class="text-center mb-6">
			<h1
				class="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wider drop-shadow-lg"
			>
				TO-DO NOW
			</h1>
		</div>

		<div class="w-full mb-4">
			<input
				type="date"
				v-model="selectedDate"
				id="date-input"
				class="w-full shadow-black bg-zinc-400 text-black placeholder:text-gray-600 hover:bg-zinc-500 px-4 py-2 rounded-lg focus:outline-none shadow-md focus:shadow-lg transition duration-300"
			/>
		</div>

		<div
			class="flex flex-col sm:flex-row w-full mb-4 shadow-black shadow-none sm:shadow-md rounded-lg"
		>
			<input
				type="text"
				v-model="newTask"
				class="flex-grow bg-zinc-400 text-black placeholder:text-gray-600 hover:bg-zinc-500 px-4 py-2 rounded-l-lg rounded-r-lg focus:outline-none transition sm:rounded-r-none shadow-black shadow-md sm:shadow-none mb-2 sm:mb-0"
				placeholder="Write a task"
				@keyup.enter="addTask"
			/>

			<button
				@click="addTask"
				class="bg-zinc-800 shadow-black shadow-md sm:shadow-none text-white px-6 py-2 rounded-r-lg rounded-l-lg sm:rounded-l-none hover:bg-zinc-900 transition duration-300 hover:shadow-lg"
			>
				Add task
			</button>
		</div>

		<ul class="w-full shadow-black">
			<li
				v-for="task in filterTasks"
				:key="task.id"
				class="shadow-black mb-4 p-4 bg-zinc-800 rounded-lg shadow-md transition duration-300"
			>
				<div class="flex sm:flex-row items-center justify-between mb-2">
					<div class="flex items-center max-w-2/3 sm:w-auto">
						<input
							type="checkbox"
							v-model="task.done"
							class="mr-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span
							:class="{
								'line-through text-gray-500': task.done,
								'text-white': !task.done,
							}"
							class="text-lg"
						>
							{{ task.text }}
						</span>
					</div>

					<div
						class="flex items-center justify-between mt-2 space-x-2 min-w-1/3 max-w-1/2"
					>
						<select
							class="text-black bg-gray-400 hover:bg-gray-500 rounded-md text-center px-0 py-1 shadow focus:outline-none focus:ring-2 focus:ring-gray-600 sm:px-2"
							v-model="task.priority"
						>
							<option value="1">High</option>
							<option value="2">Medium</option>
							<option value="3">Low</option>
						</select>

						<button
							@click="removeTask(task)"
							class="bg-gray-400 hover:bg-gray-500 text-black rounded-xl p-2 transition duration-300 shadow-md hover:shadow-lg"
						>
							<img
								src="../assets/img/iconGarbage.png"
								alt="Delete Task"
								class="w-5 h-5"
							/>
						</button>
					</div>
				</div>

				<div class="flex flex-col mb-2 space-y-2">
					<div
						class="flex items-center flex-col sm:flex-row w-full mb-4 shadow-black shadow-none sm:shadow-md rounded-lg mt-4 space-x-0 sm:space-x-2"
					>
						<input
							type="text"
							v-model="task.newSubtask"
							class="flex-grow bg-zinc-700 text-white placeholder:text-white hover:bg-zinc-600 px-4 py-2 rounded-lg transition duration-300 focus:outline-none sm:max-w-full mb-2 sm:mb-0"
							placeholder="Write a subtask"
							@keyup.enter="addSubtask(task)"
						/>

						<button
							@click="addSubtask(task)"
							class="bg-zinc-400 hover:bg-zinc-500 text-black text-center px-3 py-2 rounded-md shadow-md hover:shadow-lg transition duration-300 text-base"
						>
							Add Subtask
						</button>
					</div>

					<ul class="ml-2 mt-2">
						<li
							v-for="subtask in task.subtasks"
							:key="subtask.id"
							class="flex items-center mb-1 space-x-2"
						>
							<input
								type="checkbox"
								v-model="subtask.done"
								class="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<span
								:class="{
									'line-through text-gray-500': subtask.done,
									'text-white': !subtask.done,
								}"
							>
								{{ subtask.text }}
							</span>
							<button
								@click="removeSubtask(task, subtask)"
								class="bg-gray-400 hover:bg-gray-500 text-black rounded-xl p-2 transition duration-300 shadow-md hover:shadow-lg"
							>
								<img
									src="../assets/img/iconGarbage.png"
									alt="Delete Task"
									class="w-5 h-5"
								/>
							</button>
						</li>
					</ul>
				</div>
			</li>
		</ul>

		<div class="flex flex-col sm:flex-row justify-between mt-4 w-full">
			<button
				@click="hideCompleted = !hideCompleted"
				:disabled="!hasCompletedTask"
				class="bg-zinc-800 hover:bg-zinc-900 text-white py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-0 shadow-black shadow-md"
			>
				{{ hideCompleted ? 'Show All' : 'Hide Completed' }}
			</button>

			<button
				class="flex bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-900 transition duration-300 mb-4 justify-center shadow-black shadow-md"
				@click="sendAllTasks"
			>
				Send All Tasks
			</button>

			<button
				@click="deleteAll"
				class="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg transition duration-300 shadow-black shadow-md"
			>
				Delete All
			</button>
		</div>
	</main>
</template>

<style scoped></style>
