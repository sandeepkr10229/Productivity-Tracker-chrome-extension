document.addEventListener("DOMContentLoaded", () => {
const classification = {
  "leetcode.com": "productive",
  "www.leetcode.com": "productive",
  "github.com": "productive",
  "www.github.com": "productive",
  "stackoverflow.com": "productive",
  "www.stackoverflow.com": "productive",
  "youtube.com": "unproductive",
  "www.youtube.com": "unproductive",
  "instagram.com": "unproductive",
  "www.instagram.com": "unproductive",
  "facebook.com": "unproductive",
  "www.facebook.com": "unproductive",
  "reddit.com": "unproductive",
  "www.reddit.com": "unproductive"
};

  chrome.storage.local.get(["timeData", "resetDate"], (res) => {
    const timeData = res.timeData || {};
    const resetDate = res.resetDate ? new Date(res.resetDate) : new Date();
    const formattedResetDate = resetDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    // If no resetDate exists yet, set it now
    if (!res.resetDate) {
      chrome.storage.local.set({ resetDate: new Date().toISOString() });
    }

    let productiveTime = 0;
    let unproductiveTime = 0;
    let unknownTime = 0;

    let output = `
      <h3>🧠 Weekly Productivity Report</h3>
      <p>📅 Week Started: <strong>${formattedResetDate}</strong></p>
      <table>
        <tr><th>Website</th><th>Time (s)</th><th>Category</th></tr>`;

    for (const domain in timeData) {
      const seconds = timeData[domain];
      const category = classification[domain] || "unknown";

      if (category === "productive") productiveTime += seconds;
      else if (category === "unproductive") unproductiveTime += seconds;
      else unknownTime += seconds;

      output += `<tr>
        <td>${domain}</td>
        <td>${seconds}</td>
        <td>${category}</td>
      </tr>`;
    }

    output += `</table>
      <h3>Summary:</h3>
      <ul>
        <li>🟢 Productive Time: ${productiveTime} sec</li>
        <li>🔴 Unproductive Time: ${unproductiveTime} sec</li>
        <li>⚪ Unknown Time: ${unknownTime} sec</li>
      </ul>`;

    document.getElementById("stats").innerHTML = output;

    // Debug log
    console.log("Chart data:", {
      productiveTime,
      unproductiveTime,
      unknownTime
    });

    // Draw pie chart
    const ctx = document.getElementById("productivityChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Productive", "Unproductive", "Unknown"],
        datasets: [{
          label: "Time (sec)",
          data: [productiveTime, unproductiveTime, unknownTime],
          backgroundColor: [
            "#0fe624ff", // Yellow
            "#F44336", // Red
            "#9E9E9E"  // Gray
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.raw} sec`;
              }
            }
          }
        }
      }
    });
  });

  // Clear data + Reset week
  document.getElementById("clearData").addEventListener("click", () => {
    chrome.storage.local.set({
      timeData: {},
      resetDate: new Date().toISOString()
    }, () => {
      location.reload();
    });
  });
});
