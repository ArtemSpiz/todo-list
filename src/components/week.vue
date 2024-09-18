<script>
let id = 0

export default {
	data() {
		return {
			newTask: '',
			hideCompleted: false,
			tasks: JSON.parse(localStorage.getItem('tasksForWeek')) || {
				Monday: [],
				Tuesday: [],
				Wednesday: [],
				Thursday: [],
				Friday: [],
				Saturday: [],
				Sunday: [],
			},
			selectedDay: 'Monday',
		}
	},

	computed: {
		filterTasks() {
			return this.hideCompleted
				? this.tasks[this.selectedDay].filter(t => !t.done)
				: this.tasks[this.selectedDay]
		},

		hasCompletedTask() {
			return this.tasks[this.selectedDay].some(t => t.done)
		},
	},
	methods: {
		addTask() {
			this.tasks[this.selectedDay].push({
				id: id++,
				text: this.newTask,
				done: false,
			})
			this.newTask = ''
			this.saveTasks()
		},

		removeTask(task) {
			this.tasks[this.selectedDay] = this.tasks[this.selectedDay].filter(
				t => t !== task
			)
			this.saveTasks()
		},

		deleteAll() {
			this.tasks[this.selectedDay] = []
			this.saveTasks()
		},

		saveTasks() {
			localStorage.setItem('tasksForWeek', JSON.stringify(this.tasks))
		},
	},

	watch: {
		tasks: {
			handler() {
				this.saveTasks()
			},
			deep: true,
		},
	},
}
</script>

<template>
	<main class="flex justify-center">
		<div class="todo-list">
			<h2 class="font-mono text-center">Список завдань на тиждень</h2>

			<div class="days-selector">
				<select
					v-model="selectedDay"
					class="bg-slate-400 hover:bg-slate-500 text-black font-bold py-1 px-2 transition duration-300"
				>
					<option value="Monday">Понеділок</option>
					<option value="Tuesday">Вівторок</option>
					<option value="Wednesday">Середа</option>
					<option value="Thursday">Четвер</option>
					<option value="Friday">П'ятниця</option>
					<option value="Saturday">Субота</option>
					<option value="Sunday">Неділя</option>
				</select>
			</div>

			<form @submit.prevent="addTask">
				<input
					class="bg-slate-300 hover:bg-slate-400 text-black font-bold py-1 px-2 transition duration-300"
					v-model="newTask"
					placeholder="Нове завдання"
				/>
				<button
					class="bg-slate-500 hover:bg-slate-600 text-black font-bold py-1 px-2 rounded transition duration-300"
				>
					Додати завдання
				</button>
			</form>

			<ul>
				<li v-for="task in filterTasks" :key="task.id" class="items-center">
					<input type="checkbox" v-model="task.done" />
					<span
						class="text-lg p-2 font-light"
						:class="{ 'line-through text-gray-500': task.done }"
					>
						{{ task.text }}
					</span>
					<button
						class="bg-slate-500 hover:bg-slate-600 font-bold py-0.5 px-1 rounded transition duration-300"
						@click="removeTask(task)"
					>
						X
					</button>
				</li>
			</ul>

			<button
				class="disabled:cursor-help disabled:text-gray-500 transition duration-300 w-full mb-3 disabled:bg-slate-300 bg-slate-500 hover:bg-slate-600 text-black font-bold py-1 px-2 rounded"
				@click="hideCompleted = !hideCompleted"
				:disabled="!hasCompletedTask"
			>
				{{ hideCompleted ? 'Показати всі' : 'Сховати виконані' }}
			</button>
			<button
				class="w-full bg-slate-500 hover:bg-slate-600 text-black font-bold py-1 px-2 rounded transition duration-300"
				@click="deleteAll"
			>
				Видалити всі завдання
			</button>
		</div>
	</main>
</template>

<style scoped></style>
