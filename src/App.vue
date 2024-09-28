<script>
import Week from './components/week.vue'

export default {
	components: {
		Week,
	},
	data() {
		return {
			connection: null,
		}
	},
	methods: {
		sendMessage(tasksByDate) {
			if (this.connection && this.connection.readyState === WebSocket.OPEN) {
				const formattedTasks = this.formatTasksForSending(tasksByDate)
				if (Object.keys(formattedTasks).length > 0) {
					const message = JSON.stringify(formattedTasks)
					this.connection.send(message)
				} else {
					console.log('No tasks to send.')
				}
			} else {
				console.log('WebSocket connection is not open.')
			}
		},
		formatTasksForSending(tasksByDate) {
			let formattedTasks = {}
			for (const [date, tasks] of Object.entries(tasksByDate)) {
				if (tasks.length > 0) {
					formattedTasks[date] = tasks.map(task => ({
						id: task.id,
						text: task.text,
					}))
				}
			}
			return formattedTasks
		},
	},
	created() {
		this.connection = new WebSocket('wss://echo.websocket.org')
		this.connection.onmessage = function (event) {
			console.log('Tasks sent:', event.data)
		}

		this.connection.onopen = function () {
			console.log('Successfully connected to the WebSocket server')
		}
	},
}
</script>

<template>
	<main class="min-h-screen justify-center flex flex-col bg-zinc-800">
		<div class="justify-center flex flex-col lg:flex-row lg:items-center p-11">
			\ <Week @sendTasks="sendMessage" />
		</div>
	</main>
</template>

<style scoped>
body {
	margin: 0px;
}
</style>
