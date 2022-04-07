// workers/fetch-github-profile.js
import delay from "delay";
import { expose } from "threads/worker"

expose(async function start() {
  const limit = 1000;
  for (let index1 = 0; index1 < limit; index1++) {
    for (let index2 = 0; index2 < limit; index2++) {
      for (let index3 = 0; index3 < limit; index3++) {
      }
    }
  }
  return; 
})