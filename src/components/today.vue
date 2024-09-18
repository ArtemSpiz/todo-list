<script>
let id = 0
export default {
	data() {
		return {
			newTask: '',
			hideCompleted: false,
			tasks: JSON.parse(localStorage.getItem('tasksForDay')) || [
				{ id: id++, text: 'Task 1', done: false },
				{ id: id++, text: 'Task 2', done: false },
				{ id: id++, text: 'Task 3', done: false },
			],
		}
	},

	computed: {
		filterTasks() {
			return this.hideCompleted ? this.tasks.filter(t => !t.done) : this.tasks
		},

		hasComletedTask() {
			return this.tasks.some(t => t.done)
		},

		currentDay() {
			const daysOfWeek = [
				'Неділя',
				'Понеділок',
				'Вівторок',
				'Середа',
				'Четвер',
				"П'ятниця",
				'Субота',
			]
			const today = new Date().getDay()
			return daysOfWeek[today]
		},
	},

	methods: {
		addTask() {
			const newTask = { id: id++, text: this.newTask, done: false }
			this.tasks.push(newTask)
			this.newTask = ''
			this.saveTasks()
			this.$emit('update-tasks', this.tasks)
		},

		removeTask(task) {
			this.tasks = this.tasks.filter(t => t !== task)
			this.saveTasks()
			this.$emit('update-tasks', this.tasks)
		},

		deleteAll() {
			this.tasks = []
			this.saveTasks()
			this.$emit('update-tasks', this.tasks)
		},

		saveTasks() {
			localStorage.setItem('tasksForDay', JSON.stringify(this.tasks))
		},
	},

	watch: {
		tasks: {
			handler() {
				this.saveTasks()
				this.$emit('update-tasks', this.tasks)
			},
			deep: true,
		},
	},
}
</script>

<template>
	<main class="flex justify-center">
		<div class="todo-list">
			<h2 class="font-mono text-center">Список завдань на {{ currentDay }}</h2>
			<form class="" @submit.prevent="addTask">
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
				:disabled="!hasComletedTask"
			>
				{{ hideCompleted ? 'Показати всі' : 'Сховати виконані' }}
			</button>
			<button
				class="transition duration-300 w-full bg-slate-500 hover:bg-slate-600 text-black font-bold py-1 px-2 rounded"
				@click="deleteAll"
			>
				Видалити всі завдання
			</button>
		</div>
	</main>
</template>

<style></style>
