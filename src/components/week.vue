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
		class="flex justify-center bg-zinc-700 p-20 rounded-lg shadow-2xl shadow-black w-11/12"
	>
		<div class="flex flex-col w-11/12 max-w-2xl pr-20">
			<div class="text-center mb-6">
				<h1
					class="text-white text-5xl font-extrabold tracking-wider mb-2 drop-shadow-lg"
				>
					TO-DO NOW
				</h1>
			</div>

			<div class="date-selector mb-4">
				<input
					type="date"
					v-model="selectedDate"
					id="date-input"
					class="shadow-black flex-grow bg-zinc-400 text-black placeholder:text-gray-600 hover:bg-zinc-500 px-4 py-2 rounded-lg focus:outline-none shadow-md focus:shadow-lg transition duration-300"
				/>
			</div>

			<div class="shadow-black flex mb-4 shadow-md rounded-lg">
				<input
					type="text"
					v-model="newTask"
					class="flex-grow bg-zinc-400 text-black placeholder:text-gray-600 hover:bg-zinc-500 px-4 py-2 rounded-l-lg focus:outline-none shadow-md focus:shadow-lg transition duration-300"
					placeholder="Write a task"
					@keyup.enter="addTask"
				/>

				<button
					@click="addTask"
					class="bg-zinc-800 text-white px-6 py-2 rounded-r-lg hover:bg-zinc-900 transition duration-300 shadow-md hover:shadow-lg"
				>
					Add task
				</button>
			</div>

			<ul>
				<li
					v-for="task in filterTasks"
					:key="task.id"
					class="mb-4 p-4 bg-zinc-800 rounded-lg shadow-md hover:shadow-lg transition duration-300"
				>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center">
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

						<div class="flex items-center justify-between w-1/4">
							<select
								class="text-black bg-gray-400 hover:bg-gray-500 rounded-md text-center px-2 py-1 shadow focus:outline-none focus:ring-2 focus:ring-gray-600"
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

					<div class="flex items-center mb-2">
						<input
							type="text"
							v-model="task.newSubtask"
							class="flex-grow bg-zinc-700 text-white placeholder:text-white hover:bg-zinc-700 px-4 py-2 rounded-l-lg transition duration-300 focus:outline-none"
							placeholder="Write a subtask"
							@keyup.enter="addSubtask(task)"
						/>

						<button
							@click="addSubtask(task)"
							class="text-black bg-zinc-400 hover:bg-zinc-500 text-center px-6 py-2 block rounded-r-lg"
						>
							Add Subtask
						</button>
					</div>

					<ul class="ml-6 mt-2">
						<li
							v-for="subtask in task.subtasks"
							:key="subtask.id"
							class="flex items-center mb-1"
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
								class="bg-gray-400 ml-5 hover:bg-gray-500 text-black rounded-xl p-2 transition duration-300 shadow-md hover:shadow-lg"
							>
								<img
									src="../assets/img/iconGarbage.png"
									alt="Delete Task"
									class="w-5 h-5"
								/>
							</button>
						</li>
					</ul>
				</li>
			</ul>

			<div class="flex justify-between mt-4">
				<button
					@click="hideCompleted = !hideCompleted"
					:disabled="!hasCompletedTask"
					class="bg-zinc-800 hover:bg-zinc-900 text-white py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
				>
					{{ hideCompleted ? 'Show All' : 'Hide Completed' }}
				</button>

				<button
					@click="deleteAll"
					class="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
				>
					Delete All
				</button>
			</div>
		</div>

		<div class="w-auto items-center flex flex-col justify-evenly">
			<div
				class="p-4 bg-zinc-800 shadow-md rounded-lg shadow-black"
				v-if="datesWithTasks.length"
			>
				<h3 class="font-bold text-lg text-white mb-2">Tasks for other days:</h3>
				<ul>
					<li
						v-for="dateInfo in datesWithTasks"
						:key="dateInfo.date"
						class="text-white py-1 px-2 border-b border-gray-600 hover:bg-zinc-700 transition duration-300"
					>
						Date: {{ dateInfo.date }} — {{ dateInfo.taskCount }} task
					</li>
				</ul>
			</div>
			<button
				class="flex bg-zinc-800 text-white px-6 py-2 rounded -lg hover:bg-zinc-900 transition duration-300 shadow-black shadow-md hover:shadow-lg"
				@click="sendAllTasks"
			>
				Send All Tasks
			</button>
		</div>
	</main>
</template>

<style scoped></style>
