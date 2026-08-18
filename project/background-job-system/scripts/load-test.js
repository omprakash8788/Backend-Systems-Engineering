import axios from "axios";

(async () => {

    const emails = [];

    for (let i = 1; i <= 10; i++) {

        emails.push(
            `user${i}@gmail.com`
        );

    }

    await axios.post(
        "http://localhost:5000/api/v1/bulk-email",
        {
            emails,
        }
    );

    console.log("10 jobs queued");

})();