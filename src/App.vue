<script>
import Today from './components/today.vue'
import Week from './components/week.vue'

export default {
	components: {
		Today,
		Week,
	},

	data: function () {
		return {
			tasksForToday: [],
			connection: null,
		}
	},

	methods: {
		handleUpdateTasks(tasks) {
			this.tasksForToday = tasks
		},

		sendMessage(tasks) {
			if (this.connection && this.connection.readyState === WebSocket.OPEN) {
				const message = JSON.stringify(tasks)
				this.connection.send(message)
			} else {
				console.log('WebSocket connection is not open.')
			}
		},
	},

	created: function () {
		this.connection = new WebSocket('wss://echo.websocket.org')
		this.connection.onmessage = function (event) {
			console.log('Message received:', event.data)
		}

		this.connection.onopen = function () {
			console.log('Successfully connected to the WebSocket server')
		}
	},
}
</script>

<template>
	<main class="bg bg-cover bg-center h-screen justify-center flex flex-col">
		<div
			class="justify-center flex flex-col lg:justify-evenly lg:flex-row lg:items-center"
		>
			<Today @update-tasks="handleUpdateTasks" />
			<Week />
		</div>

		<div class="justify-center flex pt-10">
			<button
				class="bg-slate-500 hover:bg-slate-600 text-black font-bold py-1 px-2 rounded transition duration-300"
				v-on:click="sendMessage(tasksForToday)"
			>
				Send Message
			</button>
		</div>
	</main>
</template>

<style>
body {
	margin: 0px;
}

.bg {
	background-image: url('./assets/img/rectangle.png');
}
</style>
