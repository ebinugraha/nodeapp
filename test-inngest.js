const { Inngest } = require("inngest");
const inngest = new Inngest({ id: "nodeapp" });

async function run() {
  await inngest.send({
    name: "trigger/youtube.poll",
    data: {
      nodeId: "cm02l617c000k0a2l23nd00as", // I will fetch a real node ID
      videoId: "dummy",
      pollingInterval: 5,
    }
  });
  console.log("Sent event");
}
run();
