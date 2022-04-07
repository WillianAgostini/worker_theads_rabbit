import { spawn, Pool, Thread, Worker } from "threads"

async function createWorker(msg) {
    const start = await spawn(new Worker("./longTime.js"))
    await start()
}

export default createWorker;