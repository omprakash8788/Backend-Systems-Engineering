
import axios from "axios";

const emails = [];

for (let i = 1; i <= 100; i++) {
    emails.push(`user${i}@gmail.com`);
}

axios.post(
    "http://localhost:5000/api/v1/bulk-email",
    { emails }
)
.then(res => {

    console.log(res.data);

})
.catch(console.error);