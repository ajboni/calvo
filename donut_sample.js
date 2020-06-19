const blessed = require("blessed");
const contrib = require("blessed-contrib");
const screen = blessed.screen();

// var pct = 10;
// var index = 0;
// var totalParameters = 5;
// getDonutData();

// function getDonutData() {
//   var donutData = [];

//   for (let i = 0; i < totalParameters; i++) {
//     let color = "green";

//     if (index === i) {
//       color = "red";
//     }
//     donutData.push({ percent: pct, label: "web3", color: color });
//   }

//   return donutData;
// }

// var donut = contrib.donut({
//   label: "Test",
//   radius: 8,
//   arcWidth: 3,
//   yPadding: 2,
//   data: getDonutData(),
// });

// screen.append(donut);
// screen.render();
// // setInterval(updateDonuts, 100);

// function updateDonuts() {
//   donut.setData(getDonutData());
//   //   console.log("asdasdsssssssssssssssssssssssssssssssssssa");
//   screen.render();
// }

screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

// screen.key(["left"], function (ch, key) {
//   if (index > 0) {
//     index--;
//     updateDonuts();
//   }
// });

// screen.key(["right"], function (ch, key) {
//   if (index < totalParameters - 1) {
//     index = index + 1;
//     updateDonuts();
//   }
// });

// screen.key(["up"], function (ch, key) {
//   updateDonuts();
//   index = index - 1;
// });

// screen.key(["down"], function (ch, key) {
//   index = index + 1;
//   updateDonuts();
// });
