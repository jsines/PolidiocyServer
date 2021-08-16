exports.log = (string) => {
	let date = new Date()
	console.log(`[${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString()}]>> ` + string)
}