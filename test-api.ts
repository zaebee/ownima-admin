import axios from "axios";
import fs from "fs";

async function run() {
  const env = fs.readFileSync('.env.example', 'utf8');
  const token = env.match(/VITE_MOCK_TOKEN=(.*)/)?.[1] || '';
  try {
    const res = await axios.get('https://api-dev.cortex.zaebuntu.com/admin/reservations?page=1&size=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const item = res.data.data?.[0];
    console.log("Keys:", Object.keys(item));
    console.log("Date fields:", {
      date_from: item?.date_from,
      date_to: item?.date_to,
      start_date: item?.start_date,
      end_date: item?.end_date,
      dates: item?.dates,
    });
    console.log("Humanized:", item?.humanized);
  } catch (err) {
    console.error("error", err.message);
  }
}
run();