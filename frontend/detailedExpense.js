document.addEventListener("DOMContentLoaded", () => {
  const tableBodyDaily = document.getElementById("table-body-daily");
  const tableBodyWeekly = document.getElementById("table-body-weekly");
  const tableBodyMonthly = document.getElementById("table-body-monthly");
  const expenseForm = document.getElementById("expense-form");

  /******************************************************************/
  //Function to fetch and display Daily expenses and weekly expense
  /******************************************************************/
  async function displayExpenses() {
    
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: token },
    };
    //sending a GET request to the backend with token in the header to fetch particular users data only
    const response = await axios.get("http://localhost:3000/user/getexpense", config);
    const { expensesDetails: data } = response.data;
    console.log(data[0].amount);
    
    /*******************Daily*****************************/
      // Clear the table
      tableBodyDaily.innerHTML = '';
      // Populate the Daily Expense table with data
      data.forEach((expense) => {
        let date = formatDate(expense.createdAt);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${date}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>Rs. ${expense.amount}</td>
        `;
        tableBodyDaily.appendChild(row);
      });

      /*******************Weekly*****************************/
      // Function to calculate total expenses for each day of the week
      function calculateWeeklyExpenses(expenses) {
        const totalExpenses = {};

        expenses.forEach(expense => {
           //calculating date of last monday
          const lastMondayDate = getLastMondayDate();
          const date1 = formatDate(lastMondayDate);
          
          const date2 = formatDate(expense.createdAt);
          if(date2 >= date1){
           
            const date = new Date(expense.createdAt);
            const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });

            if (!totalExpenses[dayOfWeek]) {
              totalExpenses[dayOfWeek] = 0;
            }

            totalExpenses[dayOfWeek] += expense.amount;
          }
        });

        return totalExpenses;
      }
      const totalExpensesByDay = calculateWeeklyExpenses(data);

      // Print the total expenses for each day of the week
      for (const day in totalExpensesByDay) {
        const tody = new Date();
        const month = tody.toLocaleString('default', { month: 'long' });
        console.log(month);
        const rowWeekly = document.createElement("tr");
        rowWeekly.innerHTML = `
          <td>${day}</td>
          <td>${month}</td>
          <td>Rs. ${totalExpensesByDay[day]}</td>
      `;
      tableBodyWeekly.appendChild(rowWeekly);
      }

    /*******************Monthly*****************************/
    // Get the current year
    const currentYear = new Date().getFullYear();
    // Create an object to store the monthly expenses
    const monthlyExpenses = {};

    // Iterate through the data and sum expenses by month for the current year
    data.forEach((entry) => {
      const expenseDate = new Date(entry.createdAt);
      if (expenseDate.getFullYear() === currentYear) {
        const expenseMonth = expenseDate.getMonth() + 1; // Adding 1 to get the month (0-indexed)
        const expenseAmount = entry.amount;

        if (!monthlyExpenses[expenseMonth]) {
          monthlyExpenses[expenseMonth] = 0;
        }

        monthlyExpenses[expenseMonth] += expenseAmount;
      }
    });

    // Display the monthly expenses for the current year
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(currentYear, month - 1, 1).toLocaleString('default', { month: 'long' });
      const totalExpenses = monthlyExpenses[month] || 0;
      console.log(`${monthName}: $${totalExpenses}`);
      const rowMonthly = document.createElement("tr");
          rowMonthly.innerHTML = `
              <td>${monthName}</td>
              <td>${currentYear}</td>
              <td>Rs. ${totalExpenses}</td>
          `;
          tableBodyMonthly.appendChild(rowMonthly);
    }
  }


      //Helper Function to get date of last monday
      function getLastMondayDate() {
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
          const daysToLastMonday = (dayOfWeek + 6) % 7; // Calculate how many days ago the last Monday was

          // Create a new date to avoid modifying the original date
          const lastMonday = new Date(today);
          lastMonday.setDate(today.getDate() - daysToLastMonday);

          // Check if the last Monday was in the previous month
          if (lastMonday.getMonth() !== today.getMonth()) {
            // If the last Monday is in a different month, adjust the month and year accordingly
            lastMonday.setMonth(today.getMonth());
            lastMonday.setFullYear(today.getFullYear());
          }
          return lastMonday.toDateString();
      }

      function formatDate(dateString) {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-GB');
        return formattedDate;
      }

        // Fetch and display expenses when the page loads
      displayExpenses();
});

// console.log('Date of the last Monday:', lastMondayDate);